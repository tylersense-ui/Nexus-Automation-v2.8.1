/** @param {NS} ns */
export async function main(ns) {
    ns.tprint("--- NEXUS SHOPPING LIST : OBJECTIF DAEDALUS (30 UNIQUE AUGS) ---");
    
    const checklist = [
        { f: "CyberSec", n: "Cranial Signal Processors - Gen I" },
        { f: "CyberSec", n: "Cranial Signal Processors - Gen II" },
        { f: "CyberSec", n: "NeuroScanner Optimization" },
        { f: "Tian Di Hui", n: "Social Engineering Aids" },
        { f: "Tian Di Hui", n: "Speech Processor Enhancement" },
        { f: "NiteSec", n: "Embedded Netburner Module" },
        { f: "NiteSec", n: "DataJack" },
        { f: "The Black Hand", n: "Artificial Synaptic Potentiation" },
        { f: "The Black Hand", n: "Enhanced Myelin Sheathing" },
        { f: "BitRunners", n: "Artificial Bio-node" },
        { f: "BitRunners", n: "Neuroreceptor Management Implant" },
        { f: "Chongqing", n: "Neurelink" },
        { f: "New Tokyo", n: "NutriGen Implant" },
        { f: "Ishima", n: "INFRARET Enhancement" },
        { f: "Volhaven", n: "Liminal Rejuvenation" },
        { f: "Sector-12", n: "CashRoot Starter Kit" },
        { f: "Aevum", n: "PCMatrix" }
    ];

    ns.tprint("CONSEIL : Achète les plus CHÈRES en premier (ex: BitRunners) !");
    ns.tprint("Puis complète avec les villes (Aevum, Sector-12, etc.)");
    ns.tprint("Tu as $1.10t, tu peux quasiment TOUT acheter d'un coup.");
    
    let count = 0;
    checklist.forEach(a => {
        ns.tprint(`[ ] ${a.f.padEnd(15)} | ${a.n}`);
        count++;
    });
    
    ns.tprint(`----------------------------------------------------------`);
    ns.tprint(`Total listées ici : ${count}. Il t'en manque ~13 autres.`);
    ns.tprint("Cherche dans les factions de combat ou les méga-corporations !");
}