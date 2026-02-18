/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tprint("INITIATION DE LA SÉQUENCE DE BOOT NEXUS...");

    // 1. NETTOYAGE DES ANCIENS PROCESSUS
    // On tue les anciens scripts pour éviter les conflits de RAM
    const scriptsToKill = [
        "core/orchestrator.js", 
        "core/batcher.js", 
        "ui/dashboard.js"
    ];
    
    scriptsToKill.forEach(script => {
        if (ns.scriptRunning(script, "home")) {
            ns.scriptKill(script, "home");
            ns.tprint(`Terminaison de ${script}...`);
        }
    });

    await ns.asleep(1000);

    // 2. ACCÈS RÉSEAU
    // On lance ton script de nuke pour ouvrir les ports sur Phantasy et les autres
    if (ns.fileExists("nuke-all.js")) {
        ns.tprint("Lancement du protocole d'intrusion (nuke-all.js)...");
        ns.run("nuke-all.js");
        await ns.asleep(2000); // On laisse le temps au scan de finir
    }

    // 3. LANCEMENT DE L'INTERFACE
    if (ns.fileExists("ui/dashboard.js")) {
        ns.tprint("Initialisation du Dashboard v6.1...");
        ns.run("ui/dashboard.js");
        await ns.asleep(1000);
    }

    // 4. LANCEMENT DU MOTEUR DE PROFIT
    if (ns.fileExists("core/batcher.js")) {
        ns.tprint("Activation du Batcher Nexus Prime...");
        ns.run("core/batcher.js");
    } else {
        ns.tprint("ERREUR : core/batcher.js introuvable. Repli sur l'orchestrateur...");
        ns.run("core/orchestrator.js");
    }

    ns.tprint("SYSTÈME NEXUS OPÉRATIONNEL. BONNE CHASSE.");
}