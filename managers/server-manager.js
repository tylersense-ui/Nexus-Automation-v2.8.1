import { CONFIG } from "/lib/constants.js";
import { Logger } from "/lib/logger.js";

/** * Nexus-Apex v44.0
 * Module: Server Manager
 * Description: Gestionnaire d'infrastructure matérielle (Achat et Upgrade).
 * Logic: Utilise le surplus financier pour acheter/améliorer jusqu'à 25 serveurs en calculant le ROI.
 * Usage: Lancé par l'Orchestrateur ou manuellement (run /managers/server-manager.js)
 */

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    const log = new Logger(ns, "INFRA");
    
    const PSERV_PREFIX = CONFIG.MANAGERS.PSERV_PREFIX || "nexus-node-";
    const MAX_SERVERS = 25;
    const GLOBAL_MAX_RAM = ns.getPurchasedServerMaxRam();
    
    const MAX_ROI_HOURS = 8; 

    log.info("Manager d'infrastructure Apex v44.0 actif.");

    while (true) {
        const pservs = ns.getPurchasedServers();
        const cash = ns.getServerMoneyAvailable("home");
        // Optimisation : On tolère l'appel coûteux car la boucle est lente (5s)
        const income = ns.getTotalScriptIncome()[0] || 0; 
        
        // Si l'infrastructure est au niveau maximum, on quitte proprement !
        let allMaxed = pservs.length === MAX_SERVERS && 
                       pservs.every(s => ns.getServerMaxRam(s) >= GLOBAL_MAX_RAM);

        if (allMaxed) {
            log.info("Infrastructure au niveau maximum (25x 1PB). Fin du script.");
            return; // --- ARRÊT PROPRE VALIDÉ ---
        }

        let safetyMargin = (cash > 1e15) ? cash * 0.9 : 100e9; 
        let budget = Math.max(0, (cash - safetyMargin) * 0.1); 

        if (budget <= 0) {
            await ns.asleep(10000);
            continue;
        }

        if (pservs.length < MAX_SERVERS) {
            const cost = ns.getPurchasedServerCost(8);
            if (budget >= cost) {
                let name = `${PSERV_PREFIX}${pservs.length}`;
                if (ns.purchaseServer(name, 8)) {
                    log.info(`Nouveau node : ${name} (8GB)`);
                }
            }
        } else {
            let target = pservs
                .map(s => ({ name: s, ram: ns.getServerMaxRam(s) }))
                .filter(s => s.ram < GLOBAL_MAX_RAM)
                .sort((a, b) => a.ram - b.ram)[0];

            if (target) {
                const nextRam = target.ram * 2;
                const upgradeCost = ns.getPurchasedServerUpgradeCost(target.name, nextRam);

                const estimatedProfitGain = income * 0.015; 
                const roiHours = upgradeCost / estimatedProfitGain / 3600;

                if (budget >= upgradeCost && roiHours < MAX_ROI_HOURS) {
                    if (ns.upgradePurchasedServer(target.name, nextRam)) {
                        log.info(`Upgrade : ${target.name} -> ${ns.formatRam(nextRam)} (ROI: ${roiHours.toFixed(1)}h)`);
                    }
                }
            }
        }

        await ns.asleep(5000);
    }
}