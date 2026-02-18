import { Logger } from "/lib/logger.js";

/** * Nexus-Automation v2.8.1
 * Module: Corp Manager (Lite)
 */

export async function main(ns) {
    ns.disableLog("ALL");
    const log = new Logger(ns, "CORP");

    if (!ns.corporation.hasCorporation()) {
        log.warn("Pas de Corporation détectée.");
        return;
    }

    while (true) {
        const corp = ns.corporation.getCorporation();
        
        // Logique de recrutement automatique dans les bureaux existants
        for (const divisionName of corp.divisions) {
            const division = ns.corporation.getDivision(divisionName);
            for (const city of division.cities) {
                const office = ns.corporation.getOffice(divisionName, city);
                if (office.numEmployees < office.size) {
                    ns.corporation.hireEmployee(divisionName, city);
                    log.info(`Recrutement : ${divisionName} à ${city}`);
                }
            }
        }

        // Gestion automatique du prix de vente (Market-TA si disponible)
        // ... Logique simplifiée pour v2.8.1 ...

        await ns.asleep(60000);
    }
}
