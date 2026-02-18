import { Logger } from "/lib/logger.js";
import { CONFIG } from "/lib/constants.js";

/** * Nexus-Automation v2.8.1
 * Module: Target Watcher
 */

export async function main(ns) {
    ns.disableLog("ALL");
    const log = new Logger(ns, "WATCHER");
    
    while (true) {
        const portData = ns.peek(CONFIG.PORTS.TARGET_QUEUE);
        if (portData === "NULL PORT DATA") {
            await ns.asleep(5000);
            continue;
        }

        const data = JSON.parse(portData);
        const server = ns.getServer(data.target);

        const secDiff = server.hackDifficulty - server.minDifficulty;
        const moneyPerc = (server.moneyAvailable / server.moneyMax) * 100;

        if (secDiff > 3 || moneyPerc < 80) {
            log.warn(`Alerte : ${data.target} est instable (Sec+${secDiff.toFixed(2)}, Cash ${moneyPerc.toFixed(1)}%)`);
            // Ici, le watcher pourrait écrire sur un port pour forcer le Controller en mode "Repair"
        }

        await ns.asleep(2000); // Scan rapide toutes les 2 secondes
    }
}