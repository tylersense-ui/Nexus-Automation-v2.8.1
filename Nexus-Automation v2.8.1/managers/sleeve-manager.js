import { Logger } from "/lib/logger.js";

/** * Nexus-Automation v2.8.1
 * Module: Sleeve Manager
 */

export async function main(ns) {
    ns.disableLog("ALL");
    const log = new Logger(ns, "SLEEVE");

    if (!ns.sleeve) return;

    while (true) {
        const numSleeves = ns.sleeve.getNumSleeves();

        for (let i = 0; i < numSleeves; i++) {
            const stats = ns.sleeve.getSleeveStats(i);

            // 1. Priorité absolue : Récupérer le choc (Shock)
            if (stats.shock > 0) {
                ns.sleeve.setToShockRecovery(i);
            } 
            // 2. Synchronisation si nécessaire
            else if (stats.sync < 100) {
                ns.sleeve.setToSynchronize(i);
            } 
            // 3. Tâches productives (Crime pour le Karma/Argent)
            else {
                const task = ns.sleeve.getTask(i);
                if (!task || task.type !== "CRIME") {
                    ns.sleeve.setToCommitCrime(i, "Homicide");
                }
            }
        }
        await ns.asleep(60000); // Check toutes les minutes
    }
}