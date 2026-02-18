/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(600, 450);

    const solde = ns.getServerMoneyAvailable("home");
    
    // Données sourcées directement depuis ta Liste Canonique
    const database = [
        { n: "ADR-V1 Pheromone Gene", c: 17500e6, r: "3.75m", f: "Tian Di Hui", i: "🧬" }, // [cite: 1]
        { n: "ADR-V2 Pheromone Gene", c: 550000e6, r: "62.5m", f: "Bachman", i: "🧬" }, // [cite: 2]
        { n: "Social Negotiation Assistant", c: 30000e6, r: "6.25m", f: "Tian Di Hui", i: "🤝" }, // [cite: 63]
        { n: "BitRunners Neurolink", c: 4375e9, r: "875m", f: "BitRunners", i: "🧠" }, // [cite: 10]
        { n: "Neural Accelerator", c: 1750e9, r: "200m", f: "BitRunners", i: "⚡" }, // [cite: 44]
        { n: "Cranial Signal Processors - G5", c: 2250e9, r: "250m", f: "BitRunners", i: "💻" }, // [cite: 20]
        { n: "Neuroreceptor Management", c: 550000e6, r: "75m", f: "Tian Di Hui", i: "📡" }, // [cite: 49]
        { n: "The Red Pill", c: 0, r: "2500m", f: "Daedalus", i: "💊" } // 
    ];

    ns.print(`┌──────────────────────────────────────────────────┐`);
    ns.print(`   NEXUS SHOPPING CATALOG [ ${ns.formatNumber(solde, 2)} ]`);
    ns.print(`└──────────────────────────────────────────────────┘`);
    ns.print(`  STATUT | AUGMENTATION             | PRIX      `);
    ns.print(`  ───────|──────────────────────────|───────────`);

    database.forEach(aug => {
        const canAfford = solde >= aug.c;
        const statusIcon = canAfford ? "✅ READY" : "❌ LOCK ";
        ns.print(`  ${statusIcon} | ${aug.i} ${aug.n.padEnd(24)} | ${ns.formatNumber(aug.c, 1)}`);
    });

    ns.print(`──────────────────────────────────────────────────`);
    ns.print(` 💡 CONSEIL : La réputation Daedalus est la clé.`);
    ns.print(` Bonus Réputation actuel via Share : +${((ns.getSharePower()-1)*100).toFixed(2)}%`);
}