import { CONFIG } from "/lib/constants.js";
import { Network } from "/lib/network.js";
import { Capabilities } from "/lib/capabilities.js";

/** * Nexus-Apex v44.0
 * Module: Network Watcher
 * Description: Moniteur visuel secondaire de l'état des serveurs.
 * Logic: Ouvre un terminal détaché pour suivre la sécurité et l'argent des meilleures cibles.
 * Usage: run /hack/watcher.js
 */
export async function main(ns) {
    ns.disableLog("ALL");
    const caps = new Capabilities(ns);
    const net = new Network(ns, caps);

    ns.ui.openTail();
    // ✅ FIX : ns.moveTail() et ns.resizeTail() remplacés par ns.ui.* (APIs dépréciées en v2)
    ns.ui.moveTail(10, 500);
    ns.ui.resizeTail(538, 200);

    while (true) {
        ns.clearLog();
        const targets = net.getTopTargets(6);
        
        ns.print("--- NEXUS MONITORING ---");
        for (const t of targets) {
            const s = ns.getServer(t);
            const sec = (s.hackDifficulty - s.minDifficulty).toFixed(2);
            const cash = ((s.moneyAvailable / s.moneyMax) * 100).toFixed(1);
            
            let status = sec > 1 ? "⚠️ PREP" : "💰 BATCH";
            ns.print(`[${status}] ${t.padEnd(15)} | Sec: +${sec} | Cash: ${cash}%`);
        }
        
        await ns.asleep(2000);
    }
}

