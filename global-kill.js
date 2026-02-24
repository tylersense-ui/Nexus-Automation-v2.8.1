/** * Nexus-Apex v44.0
 * Module: Global Kill
 * Description: Arrêt d'urgence du système.
 * Logic: Parcourt tout le réseau et exécute ns.killall() partout.
 * Usage: run /global-kill.js
 */

/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint("🛑 ARRÊT D'URGENCE GLOBAL DÉCLENCHÉ");

    // 1. Nettoyage des ports de communication
    for (let i = 1; i <= 20; i++) ns.clearPort(i);

    // 2. Tuer tous les scripts sur tous les serveurs
    let allNodes = new Set(["home"]);
    function scanAll(node) {
        for (const neighbor of ns.scan(node)) {
            if (!allNodes.has(neighbor)) { 
                allNodes.add(neighbor); 
                scanAll(neighbor); 
            }
        }
    }
    scanAll("home");

    for (const host of allNodes) {
        ns.killall(host);
    }
    ns.tprint("✅ Réseau entièrement purgé et silencieux.");
}