/** @param {NS} ns */
export async function main(ns) {
    let servers = ["home"];
    const scanAll = (h) => {
        ns.scan(h).forEach(s => {
            if (!servers.includes(s)) {
                servers.push(s);
                scanAll(s);
            }
        });
    };
    scanAll("home");

    ns.tprint(`🧹 Nettoyage de ${servers.length} serveurs...`);

    for (const s of servers) {
        if (s === "home") {
            // Sur home, on ne tue que les workers, pas le dashboard !
            ns.scriptKill("/tools/worker-simple.js", "home");
        } else {
            // Sur les autres serveurs, on vide tout
            if (ns.hasRootAccess(s)) {
                ns.killall(s);
            }
        }
    }
    ns.tprint("✨ Réseau nettoyé. RAM libérée.");
}