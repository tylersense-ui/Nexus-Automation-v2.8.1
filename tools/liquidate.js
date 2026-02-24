/** * Nexus-Apex v44.0
 * Module: Tool - Liquidate
 * Description: Vente d'urgence (Panic Button boursier).
 * Logic: Vend l'intégralité du portefeuille d'actions pour générer du cash immédiat.
 * Usage: run /tools/liquidate.js
 */

/** @param {NS} ns */
export async function main(ns) {
    if (!ns.stock.hasTIXAPIAccess()) {
        ns.tprint("❌ Accès API TIX manquant.");
        return;
    }
    
    let totalLiquidation = 0;
    for (const sym of ns.stock.getSymbols()) {
        const [shares] = ns.stock.getPosition(sym);
        if (shares > 0) {
            const price = ns.stock.sellStock(sym, shares);
            totalLiquidation += (shares * price);
            ns.tprint(`Vendu ${shares} de ${sym} pour $${ns.formatNumber(shares * price)}`);
        }
    }
    ns.tprint(`✅ Liquidation terminée. Total récupéré : $${ns.formatNumber(totalLiquidation)}`);
}