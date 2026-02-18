/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(300, 250);

    const goals = [
        { name: "relaySMTP.exe", price: 5e6 },
        { name: "HTTPWorm.exe", price: 30e6 },
        { name: "SQLInject.exe", price: 250e6 },
        { name: "DeepscanV2.exe", price: 25e6 },
        { name: "Formulas.exe", price: 5e9 }
    ];

    while (true) {
        ns.clearLog();
        const money = ns.getServerMoneyAvailable("home");
        
        ns.print("--- LISTE DE COURSES ---");
        for (const item of goals) {
            const owned = ns.fileExists(item.name, "home");
            const status = owned ? "✅ [ACQUIS]" : 
                           (money >= item.price ? "💰 [PRÊT !]" : `⏳ $${ns.formatNumber(item.price - money)} manquant`);
            
            ns.print(`${item.name.padEnd(15)}: ${status}`);
        }

        ns.print("------------------------");
        ns.print("CONSEIL BN1 :");
        ns.print("Vérifie tes factions (CSEC,");
        ns.print("CyberSec) dès que tu as");
        ns.print("le niveau de hack requis.");
        
        await ns.asleep(5000);
    }
}