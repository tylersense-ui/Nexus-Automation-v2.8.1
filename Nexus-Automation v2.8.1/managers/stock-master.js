/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    const TIX = ns.stock.hasTIXAPIAccess();
    const DATA = ns.stock.has4SDataTIXAPIAccess();

    if (!TIX) {
        ns.tprint("ERREUR CRITIQUE: Achetez l'accès TIX au World Stock Exchange !");
        return;
    }

    // Configuration
    const MIN_FORECAST = 0.60; // On achète si probabilité > 60%
    const SELL_FORECAST = 0.50; // On vend si probabilité < 50%
    const MIN_CASH = 100000000; // Garder 100m de cash de sécurité
    const COMMISSION = 100000; // Frais de transaction

    while (true) {
        ns.clearLog();
        const symbols = ns.stock.getSymbols();
        let playerMoney = ns.getServerMoneyAvailable("home");

        for (const sym of symbols) {
            const pos = ns.stock.getPosition(sym);
            const shares = pos[0];
            const avgPrice = pos[1];
            const forecast = ns.stock.getForecast(sym);
            const askPrice = ns.stock.getAskPrice(sym);
            const bidPrice = ns.stock.getBidPrice(sym);
            const maxShares = ns.stock.getMaxShares(sym);

            // LOGIQUE DE VENTE
            // Si la tendance s'inverse (< 50%) et qu'on a des actions, on vend tout.
            if (shares > 0 && forecast < SELL_FORECAST) {
                const gain = (bidPrice * shares) - (avgPrice * shares) - (COMMISSION * 2);
                ns.stock.sellStock(sym, shares);
                ns.print(`💸 VENTE ${sym}: Gain estimé $${ns.formatNumber(gain)}`);
                continue; // Passer au suivant
            }

            // LOGIQUE D'ACHAT
            // Si la tendance est bonne (> 60%) et qu'on a du cash
            if (forecast >= MIN_FORECAST) {
                let availableMoney = ns.getServerMoneyAvailable("home") - MIN_CASH;
                let sharesToBuy = Math.min(maxShares - shares, availableMoney / askPrice);
                
                // On achète seulement si on peut prendre un gros paquet (pour amortir la commission)
                if (sharesToBuy * askPrice > COMMISSION * 1000) {
                    ns.stock.buyStock(sym, sharesToBuy);
                    ns.print(`📈 ACHAT ${sym}: ${ns.formatNumber(sharesToBuy)} actions`);
                }
            }
        }
        
        // Petit reporting dans les logs du script
        const portfolio = symbols.map(s => {
            const p = ns.stock.getPosition(s);
            return p[0] * ns.stock.getBidPrice(s);
        }).reduce((a, b) => a + b, 0);
        
        ns.print(`PORTFOLIO VALUE: $${ns.formatNumber(portfolio, 2)}`);
        await ns.asleep(6000); // 6 secondes (un tick de marché)
    }
}