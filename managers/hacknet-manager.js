import { CONFIG } from "/lib/constants.js";
import { Logger } from "/lib/logger.js";

/** * Nexus-Apex v44.0
 * Module: Hacknet Manager
 * Description: Gestionnaire des nœuds Hacknet pour revenu passif.
 * Logic: Calcule l'upgrade la plus rentable et l'achète avec une fraction du surplus.
 * Usage: Lancé par l'Orchestrateur ou manuellement (run /managers/hacknet-manager.js)
 */

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    const log = new Logger(ns, "HNET");
    
    log.info("Manager Hacknet Apex v44.0 actif.");

    while (true) {
        const cash = ns.getServerMoneyAvailable("home");
        const income = ns.getTotalScriptIncome()[0] || 0;
        
        // Budget : On garde toujours une réserve de sécurité (1m en début, 1b en late)
        const safetyMargin = (income > 1e9) ? 10e9 : 1e6;
        const budget = Math.max(0, (cash - safetyMargin) * 0.3); // On investit 30% du surplus

        if (budget <= 0) {
            await ns.asleep(10000);
            continue;
        }

        // Cache du nombre de nœuds pour optimisation RAM/CPU
        const numNodes = ns.hacknet.numNodes();

        // 1. TENTATIVE D'ACHAT DE NOUVEAU NODE
        if (numNodes < 20) { // Limite configurable (peut être passée dans constants à l'avenir)
            const cost = ns.hacknet.getPurchaseNodeCost();
            if (budget >= cost) {
                const index = ns.hacknet.purchaseNode();
                if (index !== -1) log.info(`Nouveau node acheté : hacknet-node-${index}`);
            }
        }

        // 2. OPTIMISATION DES UPGRADES (ROI)
        let bestUpgrade = null;
        let minCost = Infinity;

        for (let i = 0; i < numNodes; i++) {
            const upgrades = [
                { type: "level", cost: ns.hacknet.getLevelUpgradeCost(i, 10) },
                { type: "ram", cost: ns.hacknet.getRamUpgradeCost(i, 2) },
                { type: "cores", cost: ns.hacknet.getCoreUpgradeCost(i, 1) }
            ];

            for (const up of upgrades) {
                if (up.cost < budget && up.cost < minCost) {
                    minCost = up.cost;
                    bestUpgrade = { id: i, type: up.type };
                }
            }
        }

        if (bestUpgrade) {
            let success = false;
            if (bestUpgrade.type === "level") success = ns.hacknet.upgradeLevel(bestUpgrade.id, 10);
            else if (bestUpgrade.type === "ram") success = ns.hacknet.upgradeRam(bestUpgrade.id, 2);
            else if (bestUpgrade.type === "cores") success = ns.hacknet.upgradeCore(bestUpgrade.id, 1);
            
            if (success) ns.print(`Upgrade ${bestUpgrade.type} sur node ${bestUpgrade.id} effectuée.`);
        }

        await ns.asleep(2000);
    }
}