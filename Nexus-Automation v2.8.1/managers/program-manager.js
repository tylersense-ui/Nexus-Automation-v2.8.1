/** @param {NS} ns */
export async function main(ns) {
    const programs = [
        { name: "BruteSSH.exe", price: 500000 },
        { name: "FTPCrack.exe", price: 1500000 },
        { name: "relaySMTP.exe", price: 5000000 },
        { name: "HTTPWorm.exe", price: 30000000 },
        { name: "SQLInject.exe", price: 250000000 }
    ];

    ns.disableLog("ALL");

    while (true) {
        let hasTor = ns.scan("home").includes("darkweb");
        
        for (let prog of programs) {
            if (!ns.fileExists(prog.name, "home")) {
                let money = ns.getServerMoneyAvailable("home");
                
                if (!hasTor && money > 200000) {
                    ns.print(`WARN: Accès TOR manquant. Achète-le manuellement sur le Terminal.`);
                } else if (hasTor && money > prog.price) {
                    // Note : ns.purchaseProgram demande l'accès Singularity (BitNode 4).
                    // Si le script crash encore ici, c'est que Singularity n'est pas actif.
                    // On se contente alors d'une notification.
                    ns.print(`INFO: Tu peux acheter ${prog.name} sur le darkweb !`);
                }
            }
        }
        await ns.asleep(60000); // Vérification toutes les minutes
    }
}