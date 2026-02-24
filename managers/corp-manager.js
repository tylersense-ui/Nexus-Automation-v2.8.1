/** * Nexus-Apex v44.0
 * Module: Corporation Manager
 * Description: Automatisation de la Mégacorporation (Agriculture).
 * Logic: Crée des bureaux, recrute, assigne (Op/Eng/Bus/Mgt), et revend au prix fort.
 * Usage: run /managers/corp-manager.js
 */

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    const c = ns.corporation;

    if (!c.hasCorporation()) {
        try {
            c.createCorporation("Nexus-Global", false); 
            ns.tprint("🏢 Nexus Global Corporation fondée !");
        } catch {
            ns.tprint("❌ Fonds insuffisants pour créer une Corporation (150b requis).");
            return;
        }
    }

    const divisionName = "Nexus-Agro";
    if (!c.getCorporation().divisions.includes(divisionName)) {
        c.expandIndustry("Agriculture", divisionName);
    }

    ns.tprint("🚀 Nexus Corp-Master Apex : Gestion active...");

    while (true) {
        const corp = c.getCorporation();
        const division = c.getDivision(divisionName);

        for (const city of division.cities) {
            const office = c.getOffice(divisionName, city);
            
            if (office.size > office.numEmployees) {
                for (let i = 0; i < (office.size - office.numEmployees); i++) {
                    c.hireEmployee(divisionName, city);
                }
                await c.setAutoJobAssignment(divisionName, city, "Operations", Math.floor(office.size * 0.4));
                await c.setAutoJobAssignment(divisionName, city, "Engineer",    Math.floor(office.size * 0.3));
                await c.setAutoJobAssignment(divisionName, city, "Business",    Math.floor(office.size * 0.2));
                await c.setAutoJobAssignment(divisionName, city, "Management",  Math.ceil(office.size  * 0.1));
            }

            if (corp.funds > c.getOfficeSizeUpgradeCost(divisionName, city, 3)) {
                c.upgradeOfficeSize(divisionName, city, 3);
            }
        }

        if (c.hasUnlock("Smart Supply")) {
            for (const city of division.cities) {
                c.setSmartSupply(divisionName, city, true);
            }
        }

        // ✅ FIX : Vente sur toutes les villes de la division (était hardcodé sur "Aevum" uniquement)
        for (const city of division.cities) {
            c.sellMaterial(divisionName, city, "Plants", "MAX", "MP");
            c.sellMaterial(divisionName, city, "Food",   "MAX", "MP");
        }

        const upgrades = ["Smart Factories", "Neural Accelerators", "FocusWires", "ABC Sales"];
        for (const upgrade of upgrades) {
            if (corp.funds > c.getUpgradeLevelCost(upgrade)) {
                c.getUpgradeLevel(upgrade) < 20 ? c.levelUpgrade(upgrade) : null;
            }
        }

        if (corp.funds > 1e15) { 
            c.issueDividends(0.1); 
        }

        await ns.asleep(30000); 
    }
}
