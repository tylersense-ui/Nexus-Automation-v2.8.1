/** * Nexus-Apex v44.0
 * Module: Tool - Shop Editor
 * Description: Éditeur manuel de la base de données Todo.
 * Logic: Marque une augmentation comme achetée dans le data/todo.json.
 * Usage: run /tools/shop.js [Nom de l'augmentation]
 */

/** @param {NS} ns **/
export async function main(ns) {
    const augName = ns.args.join(" ");
    const FILE_PATH = "data/todo.json";

    if (!augName || augName.trim() === "") {
        ns.tprint("❌ Usage: run tools/shop.js [Nom de l'augmentation]");
        return;
    }

    if (!ns.fileExists(FILE_PATH)) {
        ns.tprint("❌ Erreur : data/todo.json n'existe pas. Utilisez importer.js d'abord.");
        return;
    }

    let data = JSON.parse(ns.read(FILE_PATH));
    let found = false;

    data = data.map(aug => {
        if (aug.name.toLowerCase() === augName.toLowerCase()) {
            aug.bought = true;
            found = true;
        }
        return aug;
    });

    if (found) {
        await ns.write(FILE_PATH, JSON.stringify(data, null, 2), "w");
        ns.tprint(`✅ Nexus-Apex : '${augName}' marqué comme ACHETÉ.`);
    } else {
        ns.tprint(`❓ Erreur : '${augName}' introuvable dans la liste.`);
    }
}