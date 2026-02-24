/** * Nexus-Apex v44.0
 * Module: Tool - Importer
 * Description: Générateur du plan de vol Daedalus (Filtre BN1).
 * Logic: Parse le fichier texte canonique et génère data/todo.json pour cibler les augmentations clés.
 * Usage: run /tools/importer.js
 */

/** @param {NS} ns **/
export async function main(ns) {
    const INPUT_FILE = "Liste_Cannonique_augmentations_bitburner.txt";
    const OUTPUT_FILE = "data/todo.json";
    
    // FILTRE DE MISSION : Uniquement ce dont tu as besoin pour Daedalus
    const TARGET_FACTIONS = ["CyberSec", "NiteSec", "The Black Hand", "BitRunners", "Tian Di Hui", "Slum Snakes"];

    if (!ns.fileExists(INPUT_FILE)) {
        ns.tprint(`❌ Erreur : ${INPUT_FILE} introuvable.`);
        return;
    }

    const content = ns.read(INPUT_FILE);
    const lines = content.split("\n");
    const todo = [];

    ns.tprint("🔍 Nexus-Apex : Filtrage du manifeste pour les factions de progression...");

    for (let line of lines) {
        if (!line.includes("|") || line.startsWith("Légende")) continue;

        const parts = line.split("|");
        const name = parts[0].trim();
        const factions = parts[3] ? parts[3].split(",").map(f => f.trim()) : [];
        
        const isTargetFaction = factions.some(f => TARGET_FACTIONS.includes(f));
        const isNFG = name.includes("NeuroFlux Governor");

        if (isTargetFaction || isNFG) {
            let priceRaw = parts[1].trim();
            let repRaw = parts[2].trim();

            if (priceRaw === "" && parts[2]?.includes("$")) {
                priceRaw = parts[2].trim();
                repRaw = parts[3]?.trim() || "0";
            }

            // ✅ FIX CRITIQUE : Multiplicateurs corrigés (étaient tous décalés d'un facteur ×1000)
            const parseNexusVal = (str) => {
                if (!str) return 0;
                let val = str.replace(/[$,\s]/g, "").toLowerCase();
                let multiplier = 1;
                if (val.endsWith("k"))      { multiplier = 1e3;  val = val.slice(0, -1); }
                else if (val.endsWith("m")) { multiplier = 1e6;  val = val.slice(0, -1); }
                else if (val.endsWith("b")) { multiplier = 1e9;  val = val.slice(0, -1); }
                else if (val.endsWith("t")) { multiplier = 1e12; val = val.slice(0, -1); }
                return parseFloat(val.replace(",", "")) * multiplier || 0;
            };

            todo.push({
                name: name,
                price: parseNexusVal(priceRaw),
                rep: parseNexusVal(repRaw),
                bought: false,
                faction: isNFG ? "All" : factions.filter(f => TARGET_FACTIONS.includes(f))[0]
            });
        }
    }

    await ns.write(OUTPUT_FILE, JSON.stringify(todo, null, 2), "w");
    ns.tprint(`✅ Nexus-Apex : Mission planifiée. ${todo.length} augmentations ciblées.`);
    ns.tprint(`🚀 Lance 'run /tools/pre-flight.js' pour voir ton plan de vol Daedalus.`);
}
