/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0] || "n00dles";
    const workerScript = "/tools/worker-simple.js";

    // 1. Création d'un worker ultra-léger (environ 1.70 GB)
    const scriptContent = `
        /** @param {NS} ns */
        export async function main(ns) {
            const t = ns.args[0];
            while(true) {
                if (ns.getServerSecurityLevel(t) > ns.getServerMinSecurityLevel(t) + 2) await ns.weaken(t);
                else if (ns.getServerMoneyAvailable(t) < ns.getServerMaxMoney(t) * 0.8) await ns.grow(t);
                else await ns.hack(t);
            }
        }`;
    await ns.write(workerScript, scriptContent, "w");

    // 2. Scan du réseau
    let servers = ["home"];
    const scanAll = (h) => { ns.scan(h).forEach(s => { if (!servers.includes(s)) { servers.push(s); scanAll(s); } }); };
    scanAll("home");

    ns.tprint(`🧐 Analyse de ${servers.length} serveurs...`);

    for (const s of servers) {
        // Tenter d'ouvrir le serveur
        if (!ns.hasRootAccess(s)) {
            try { ns.nuke(s); } catch(e) {}
        }

        if (ns.hasRootAccess(s)) {
            // Calcul de la RAM (on laisse 4GB de sécurité sur home)
            let ramMax = ns.getServerMaxRam(s);
            let ramUsed = ns.getServerUsedRam(s);
            let ramFree = (s === "home") ? (ramMax - ramUsed - 0.5) : (ramMax - ramUsed);

            const scriptCost = ns.getScriptRam(workerScript);
            let threads = Math.floor(ramFree / scriptCost);

            if (threads > 0) {
                await ns.scp(workerScript, s, "home");
                // On ne tue les scripts QUE si ce n'est pas le script actuel
                if (s !== "home") ns.killall(s);
                
                ns.exec(workerScript, s, threads, target);
                ns.tprint(`✅ [${s}] : ${threads} threads lancés sur ${target}`);
            } else {
                ns.print(`❌ [${s}] : Pas assez de RAM libre (${ramFree.toFixed(2)}GB)`);
            }
        } else {
            ns.print(`❌ [${s}] : Pas d'accès Root.`);
        }
    }
}