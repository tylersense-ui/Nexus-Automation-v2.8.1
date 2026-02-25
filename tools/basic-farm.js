/** @param {NS} ns */
export async function main(ns) {
    // Si tu tapes un nom après le script, il le prend. Sinon, il prend joesguns par défaut.
    const target = ns.args[0] || "joesguns";
    
    ns.tprint(`🚀 Focus exclusif sur : ${target}`);

    while (true) {
        if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(target)) {
            if (!ns.hasRootAccess(target)) {
                try { ns.nuke(target); } catch {}
            }

            // Stratégie simple : Sécurité d'abord, Argent ensuite
            if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target) + 2) {
                await ns.weaken(target);
            } else if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target) * 0.9) {
                await ns.grow(target);
            } else {
                await ns.hack(target);
            }
        } else {
            ns.tprint(`❌ Niveau de hacking trop faible pour ${target}`);
            return;
        }
        await ns.asleep(100);
    }
}