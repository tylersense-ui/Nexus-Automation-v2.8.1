/** * Nexus-Apex v44.0
 * Module: Boot Sequence
 * Description: Point d'entrée de l'architecture.
 * Logic: Nettoie les ports, tue tous les processus réseau pour un "clean state", puis lance le Kernel.
 * Usage: run /boot.js
 */

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tprint("─── INITIATION SÉQUENCE NEXUS-APEX v44.0 ───");

    // 1. Nettoyage des ports
    for (let i = 1; i <= 20; i++) ns.clearPort(i);
    ns.tprint("[CLEAN] Ports de communication Nexus réinitialisés.");

    // 2. Global Kill (Réseau complet)
    ns.tprint("[CLEAN] Arrêt de tous les processus sur le réseau...");
    
    // Fonction de scan complet du réseau (Autonome pour éviter les dépendances au boot)
    const getNetworkNodes = () => {
        const visited = new Set();
        const queue = ["home"];
        while (queue.length > 0) {
            const node = queue.shift();
            if (!visited.has(node)) {
                visited.add(node);
                const neighbors = ns.scan(node);
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) queue.push(neighbor);
                }
            }
        }
        return Array.from(visited);
    };

    const allNodes = getNetworkNodes();
    const currentScript = ns.getScriptName();

    // Arrêt de tous les scripts partout
    for (const node of allNodes) {
        ns.ps(node).forEach(p => {
            // Ne pas se suicider en plein vol
            if (node === "home" && p.filename === currentScript) return;
            ns.kill(p.pid, node);
        });
    }
    
    await ns.asleep(1000);

    // 3. Lancement de l'Orchestrateur
    if (ns.fileExists("/core/orchestrator.js")) {
        ns.tprint("🚀 Lancement du Kernel Orchestrateur...");
        ns.run("/core/orchestrator.js");
    } else {
        ns.tprint("❌ ERREUR: /core/orchestrator.js introuvable !");
    }
}