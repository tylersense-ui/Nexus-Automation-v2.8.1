import { Logger } from "/lib/logger.js";
import { CONFIG } from "/lib/constants.js";

/** * Nexus-Automation v2.8.1
 * Module: Singularity Manager
 */

export async function main(ns) {
    ns.disableLog("ALL");
    const log = new Logger(ns, "SINGULARITY");
    
    // Liste des programmes prioritaires à acheter au Darkweb
    const EXES = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe", "Formulas.exe"];

    while (true) {
        // 1. Gestion du Darkweb et des Programmes
        if (ns.singularity.purchaseTor()) {
            for (const exe of EXES) {
                if (!ns.fileExists(exe, "home")) {
                    ns.singularity.purchaseProgram(exe);
                }
            }
        }

        // 2. Gestion des Factions (Acceptation automatique)
        const invites = ns.singularity.checkFactionInvitations();
        for (const faction of invites) {
            if (CONFIG.MANAGERS.AUTO_JOIN_FACTIONS) {
                ns.singularity.joinFaction(faction);
                log.info(`Nouvelle faction rejointe : ${faction}`);
            }
        }

        // 3. Logique d'activité (Priorité : Stats > Réputation > Argent)
        const player = ns.getPlayer();
        const currentWork = ns.singularity.getCurrentWork();

        if (!currentWork) {
            // Si on est trop faible, on grind les stats par le crime
            if (player.skills.hacking < 50) {
                ns.singularity.commitCrime("Mug");
            } else {
                // Sinon, on cherche à travailler pour la faction la plus avancée
                const factions = player.factions;
                if (factions.length > 0) {
                    // On travaille pour la dernière faction rejointe (souvent la plus lucrative)
                    ns.singularity.workForFaction(factions[factions.length - 1], "Hacking Labs", false);
                } else {
                    ns.singularity.commitCrime("Homicide"); // Pour le Karma (Gang)
                }
            }
        }

        // 4. Achat d'Augmentations (Automatique si on a assez de réputation et d'argent)
        autoBuyAugmentations(ns, log);

        await ns.asleep(10000); // Cycle de 10 secondes
    }
}

/**
 * Tente d'acheter les augmentations disponibles dans les factions possédées.
 */
function autoBuyAugmentations(ns, log) {
    const player = ns.getPlayer();
    for (const faction of player.factions) {
        const augs = ns.singularity.getAugmentationsFromFaction(faction);
        for (const aug of augs) {
            if (aug === "NeuroFlux Governor") continue; // On l'ignore pour l'achat auto de masse
            
            const cost = ns.singularity.getAugmentationPrice(aug);
            const repNeeded = ns.singularity.getAugmentationRepReq(aug);
            const currentRep = ns.singularity.getFactionRep(faction);

            if (player.money >= cost && currentRep >= repNeeded) {
                // Vérifier si on ne l'a pas déjà ou si elle n'est pas en attente
                const owned = ns.singularity.getOwnedAugmentations(true);
                if (!owned.includes(aug)) {
                    if (ns.singularity.purchaseAugmentation(faction, aug)) {
                        log.info(`Augmentation achetée : ${aug} chez ${faction}`);
                    }
                }
            }
        }
    }
}