/** @param {NS} ns */
export async function main(ns) {
    const targets = ["n00dles", "foodnstuff", "sigma-cosmetics", "joesguns"];
    
    while (true) {
        for (const target of targets) {
            // On vérifie si on a le niveau et l'accès
            if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(target)) {
                if (!ns.hasRootAccess(target)) {
                    try { ns.nuke(target); } catch {}
                }

                // Logique simplifiée : Affaiblir -> Grandir -> Voler
                if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target) + 5) {
                    await ns.weaken(target);
                } else if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target) * 0.8) {
                    await ns.grow(target);
                } else {
                    await ns.hack(target);
                }
            }
        }
        await ns.asleep(100);
    }
}