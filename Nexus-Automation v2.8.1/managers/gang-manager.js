import { Logger } from "/lib/logger.js";

/** * Nexus-Automation v2.8.1
 * Module: Gang Manager (Ouroboros Logic)
 */

export async function main(ns) {
    ns.disableLog("ALL");
    const log = new Logger(ns, "GANG");

    if (!ns.gang.inGang()) {
        log.warn("Pas encore dans un gang. En attente...");
        return;
    }

    while (true) {
        const myGang = ns.gang.getGangInformation();
        const memberNames = ns.gang.getMemberNames();

        // 1. Recrutement automatique
        if (ns.gang.canRecruitMember()) {
            const newName = `Member-${memberNames.length}`;
            if (ns.gang.recruitMember(newName)) {
                log.info(`Nouveau membre recruté : ${newName}`);
            }
        }

        // 2. Gestion de chaque membre
        for (const name of memberNames) {
            const info = ns.gang.getMemberInformation(name);

            // A. Ascension (Logique : On attend un multiplicateur de 1.5x minimum)
            const ascResult = ns.gang.getAscensionResult(name);
            if (ascResult && ascResult.hack >= 1.5) {
                ns.gang.ascendMember(name);
                log.info(`Ascension pour ${name} (Multiplicateur Hack atteint)`);
            }

            // B. Équipement automatique (Si on a l'argent)
            const equipment = ns.gang.getEquipmentNames();
            for (const item of equipment) {
                const cost = ns.gang.getEquipmentCost(item);
                if (ns.getPlayer().money > cost * 10) { // On garde une marge de sécurité
                    ns.gang.purchaseEquipment(name, item);
                }
            }

            // C. Attribution des tâches
            // Si le respect est faible (< 1M), on focus le Respect. Sinon, on focus l'Argent.
            if (myGang.respect < 1000000) {
                ns.gang.setMemberTask(name, "Cyberterrorisme");
            } else {
                ns.gang.setMemberTask(name, "Human Trafficking");
            }
        }

        await ns.asleep(20000); // Cycle de 20 secondes
    }
}