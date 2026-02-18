/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    const limit = ns.getPurchasedServerLimit();
    // On protège ton solde pour l'achat manuel de RelaySMTP ($5M)
    const moneyBuffer = 5000000; 

    while (true) {
        let money = ns.getServerMoneyAvailable("home");
        let servers = ns.getPurchasedServers();

        // Achat de nouveaux serveurs (64GB de base)
        if (servers.length < limit && money > ns.getPurchasedServerCost(64) + moneyBuffer) {
            ns.purchaseServer("nexus-node-" + servers.length, 64);
        }

        // Upgrade automatique (double la RAM à chaque cycle)
        for (let s of servers) {
            let currentRam = ns.getServerMaxRam(s);
            let nextRam = currentRam * 2;
            if (nextRam <= ns.getPurchasedServerMaxRam()) {
                if (money > ns.getPurchasedServerUpgradeCost(s, nextRam) + moneyBuffer) {
                    ns.upgradePurchasedServer(s, nextRam);
                }
            }
        }
        await ns.asleep(5000);
    }
}