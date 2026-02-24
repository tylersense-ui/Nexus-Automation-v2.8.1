import { CONFIG } from "/lib/constants.js";
import { Network } from "/lib/network.js";
import { Capabilities } from "/lib/capabilities.js";

/** * Nexus-Apex v44.0
 * Module: Kernel Orchestrator
 * Description: Maintient l'écosystème en vie et root automatiquement les cibles.
 * Logic: Lance les modules vitaux et scanne le réseau périodiquement pour appliquer crack().
 * Usage: run /core/orchestrator.js
 */
export async function main(ns) {
    ns.disableLog("ALL");
    const caps = new Capabilities(ns);
    const net = new Network(ns, caps);

    ns.tprint("🔧 Nexus-Apex : Initialisation du Kernel v44.0...");

    const modules = [
        { name: "CONTROLLER", path: "/hack/controller.js" },
        { name: "BATCHER",    path: "/core/batcher.js" },
        { name: "DASHBOARD",  path: "/core/dashboard.js" },
        { name: "STOCK",      path: "/managers/stock-master.js" },
        { name: "HACKNET",    path: "/managers/hacknet-manager.js" }
    ];

    for (const mod of modules) {
        if (ns.fileExists(mod.path)) {
            if (!ns.scriptRunning(mod.path, "home")) {
                ns.tprint(`🚀 Lancement du module ${mod.name}...`);
                ns.run(mod.path, 1);
            }
        } else {
            ns.tprint(`❌ ERREUR : Module ${mod.name} introuvable à ${mod.path}`);
        }
    }

    ns.tprint("✅ Kernel en ligne. Surveillance du réseau activée.");

    // Boucle de maintenance (rooting automatique réparé)
    while (true) {
        const targets = net.refresh().filter(n => !ns.hasRootAccess(n));
        for (const target of targets) {
            // Application du protocole de crack
            if (net.crack(target)) {
                ns.print(`🔓 ROOT SÉCURISÉ : Accès administrateur obtenu sur ${target}`);
            }
        }
        await ns.asleep(60000); // Check toutes les minutes pour sauver le CPU
    }
}