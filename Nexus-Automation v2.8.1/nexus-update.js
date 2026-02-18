/** @param {NS} ns */
export async function main(ns) {
    const args = ns.args;
    const targetFile = args[0];
    const newContent = args[1];

    if (!targetFile) {
        ns.tprint("❌ Usage: run nexus-update.js [path] [content]");
        ns.tprint("💡 Exemple pour tout rafraîchir : run nexus-install.js");
        return;
    }

    if (ns.fileExists(targetFile)) {
        ns.tprint(`🔄 Mise à jour de ${targetFile}...`);
        await ns.write(targetFile, newContent, "w");
        ns.tprint("✅ Patch appliqué avec succès.");
        
        // Notification à l'orchestrateur si nécessaire
        ns.toast(`Nexus Patch: ${targetFile}`, "info");
    } else {
        ns.tprint(`⚠️ Le fichier ${targetFile} n'existe pas. Création...`);
        await ns.write(targetFile, newContent, "w");
        ns.tprint("✅ Nouveau module ajouté.");
    }
}