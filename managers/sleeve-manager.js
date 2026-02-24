import { CONFIG } from "/lib/constants.js";

/** * Nexus-Apex v44.0
 * Module: Sleeve Manager
 * Description: Pilotage des Clones.
 * Logic: Priorité absolue à la baisse du Shock, puis synchronisation, et enfin assignation aux tâches.
 * Usage: run /managers/sleeve-manager.js
 */

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    
    try { ns.sleeve.getNumSleeves(); } 
    catch { 
        ns.tprint("❌ Erreur : API Sleeve non disponible. (SF10 requis)"); 
        return; 
    }

    const numSleeves = ns.sleeve.getNumSleeves();
    ns.tprint(`🚀 Nexus Sleeve-Master Apex : Gestion de ${numSleeves} unités.`);

    while (true) {
        for (let i = 0; i < numSleeves; i++) {
            const stats = ns.sleeve.getSleeveStats(i);

            // 1. RÉDUCTION DU SHOCK (Priorité absolue)
            if (stats.shock > 0) {
                ns.sleeve.setToShockRecovery(i);
                continue;
            }

            // 2. SYNCHRONISATION (Priorité 2)
            if (stats.sync < 100) {
                ns.sleeve.setToSynchronize(i);
                continue;
            }

            // 3. ACHAT D'AUGMENTATIONS
            const purchasable = ns.sleeve.getSleevePurchasableAugs(i);
            for (const aug of purchasable) {
                if (ns.getServerMoneyAvailable("home") > aug.cost * 50) { 
                    ns.sleeve.purchaseSleeveAug(i, aug.name);
                }
            }

            // 4. ASSIGNATION DES TÂCHES
            if (i === 0) {
                ns.sleeve.setToCommitCrime(i, "Homicide"); 
            } else {
                ns.sleeve.setToUniversityCourse(i, "Rothman University", "Algorithms");
            }
        }

        await ns.asleep(10000); 
    }
}