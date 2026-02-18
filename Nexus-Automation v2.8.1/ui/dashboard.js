/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(550, 650);

    const target = "phantasy";

    while (true) {
        ns.clearLog();
        let totalRam = 0; let usedRam = 0;
        let counts = { grow: 0, weaken: 0, hack: 0, share: 0 };
        
        // ANALYSE INFRASTRUCTURE
        const pservs = ns.getPurchasedServers();
        const homeRam = ns.getServerMaxRam("home");
        const homeUsed = ns.getServerUsedRam("home");
        
        let pservRamTotal = 0;
        let pservUsedTotal = 0;
        let pservMaxNode = 0; // La taille du plus gros serveur

        // Stats Home
        totalRam += homeRam;
        usedRam += homeUsed;
        ns.ps("home").forEach(p => updateCounts(p, counts));

        // Stats Pservs
        for (const s of pservs) {
            const max = ns.getServerMaxRam(s);
            const used = ns.getServerUsedRam(s);
            pservRamTotal += max;
            pservUsedTotal += used;
            totalRam += max;
            usedRam += used;
            if (max > pservMaxNode) pservMaxNode = max;

            ns.ps(s).forEach(p => updateCounts(p, counts));
        }

        // Stats Cible
        const moneyP = ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target);
        const sec = ns.getServerSecurityLevel(target);
        const minSec = ns.getServerMinSecurityLevel(target);
        
        // Stats Financières (Incluant Bourse)
        const income = ns.getScriptIncome() ? (ns.getScriptIncome()[0] || 0) : 0;
        const portfolio = getPortfolioValue(ns);
        const totalWealth = ns.getServerMoneyAvailable("home") + portfolio;

        ns.print(`┌──────────────────────────────────────────────┐`);
        ns.print(`   NEXUS INFRASTRUCTURE v10.0 [ AUDIT MODE ]`);
        ns.print(`└──────────────────────────────────────────────┘`);
        ns.print(` 💰 RICHESSE GLOBALE : $${ns.formatNumber(totalWealth, 2)}`);
        ns.print(`    ├── Cash : $${ns.formatNumber(ns.getServerMoneyAvailable("home"), 2)}`);
        ns.print(`    └── Stock: $${ns.formatNumber(portfolio, 2)}`);
        ns.print(` 📈 REVENU SCRIPT    : $${ns.formatNumber(income, 2)}/s`);
        ns.print(`────────────────────────────────────────────────`);
        ns.print(` 🏗️ INFRASTRUCTURE RÉSEAU (${ns.formatRam(totalRam)})`);
        ns.print(`    ├── HOME    : ${ns.formatRam(homeRam)} (Utilisé: ${((homeUsed/homeRam)*100).toFixed(1)}%)`);
        ns.print(`    └── CLOUD   : ${pservs.length} Nodes (Max: ${ns.formatRam(pservMaxNode)})`);
        ns.print(`    └── LOAD    : ${ns.formatRam(pservUsedTotal)} / ${ns.formatRam(pservRamTotal)}`);
        ns.print(`────────────────────────────────────────────────`);
        ns.print(` 🎯 CIBLE : ${target.toUpperCase()}`);
        ns.print(`    MONEY : [${progressBar(moneyP)}] ${(moneyP * 100).toFixed(1)}%`);
        ns.print(`    SÉCU  : [${progressBar(1 - ((sec - minSec) / 10))}] +${(sec - minSec).toFixed(2)}`);
        ns.print(`────────────────────────────────────────────────`);
        ns.print(` ⚙️ PROCESSUS ACTIFS`);
        ns.print(`    💸 HACK : ${counts.hack} threads`);
        ns.print(`    💪 GROW : ${counts.grow} threads`);
        ns.print(`    🛡️ WEAK : ${counts.weaken} threads`);
        ns.print(`    🤝 SHARE: ${counts.share} threads`);
        ns.print(`────────────────────────────────────────────────`);
        
        await ns.asleep(1000);
    }
}

function updateCounts(process, counts) {
    if (process.filename.includes("grow.js")) counts.grow += process.threads;
    if (process.filename.includes("weaken.js")) counts.weaken += process.threads;
    if (process.filename.includes("hack.js")) counts.hack += process.threads;
    if (process.filename.includes("share.js")) counts.share += process.threads;
}

function getPortfolioValue(ns) {
    let value = 0;
    if (ns.stock.hasTIXAPIAccess()) {
        for (const sym of ns.stock.getSymbols()) {
            value += ns.stock.getPosition(sym)[0] * ns.stock.getBidPrice(sym);
        }
    }
    return value;
}

function progressBar(value) {
    const bars = 18;
    const filled = Math.max(0, Math.min(bars, Math.floor(value * bars)));
    return "█".repeat(filled) + "░".repeat(bars - filled);
}