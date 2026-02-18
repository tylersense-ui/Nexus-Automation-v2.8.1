/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    const buffer = 1000000; // Garde 1M pour les .exe

    while (true) {
        if (ns.getServerMoneyAvailable("home") < buffer) {
            await ns.asleep(10000);
            continue;
        }

        if (ns.hacknet.numNodes() < 10) {
            ns.hacknet.purchaseNode();
        }

        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            let money = ns.getServerMoneyAvailable("home");
            if (money > ns.hacknet.getLevelUpgradeCost(i, 1)) ns.hacknet.upgradeLevel(i, 1);
            if (money > ns.hacknet.getRamUpgradeCost(i, 1)) ns.hacknet.upgradeRam(i, 1);
            if (money > ns.hacknet.getCoreUpgradeCost(i, 1)) ns.hacknet.upgradeCore(i, 1);
        }
        await ns.asleep(1000);
    }
}