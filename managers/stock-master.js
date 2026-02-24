import { CONFIG } from "/lib/constants.js";
import { PortHandler } from "/core/port-handler.js";

/** * Nexus-Apex v44.0
 * Module: Stock Master
 * Description: Gestionnaire autonome du marché boursier (TIX/4S).
 * Logic: Achète et vend des actions en fonction des prévisions 4S, et diffuse la valeur du portefeuille.
 * Usage: Lancé automatiquement par l'Orchestrateur. (run /managers/stock-master.js)
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    const ph = new PortHandler(ns);
    const DATA_PORT = CONFIG.PORTS.STOCK_DATA || 5; 

    if (!ns.stock.hasTIXAPIAccess()) {
        ns.print("❌ Accès API TIX manquant. Arrêt du Stock Master.");
        return;
    }

    let has4S = false;
    try { 
        ns.stock.getForecast("FSIG"); 
        has4S = true; 
    } catch {}

    /**
     * Attend le prochain tick du marché pour synchroniser les opérations.
     * Cette boucle bloque l'exécution jusqu'au rafraîchissement global des prix.
     */
    async function waitForMarketTick() {
        const sym = "FSIG";
        const initialPrice = ns.stock.getPrice(sym);
        while (ns.stock.getPrice(sym) === initialPrice) {
            await ns.asleep(200); 
        }
    }

    ns.print(`📈 Stock Master Apex v44.0 actif (Émission sur Port ${DATA_PORT}).`);

    while (true) {
        await waitForMarketTick(); 

        let totalValue = 0;
        let activePositions = 0;
        const symbols = ns.stock.getSymbols();
        
        const cash = ns.getServerMoneyAvailable("home");
        // Réserve de sécurité : 10% du cash avec un minimum de 10 milliards
        const reserve = Math.max(10e9, cash * 0.10);

        for (const sym of symbols) {
            const [shares, avgPrice, sharesShort, avgPriceShort] = ns.stock.getPosition(sym);
            const currentPrice = ns.stock.getBidPrice(sym);
            
            if (shares > 0) {
                totalValue += (shares * currentPrice);
                activePositions++;
            }

            if (!has4S) continue;

            const forecast = ns.stock.getForecast(sym);
            
            // Logique de vente/achat (Dynamique et agnostique)
            if (shares > 0 && forecast < 0.5) {
                ns.stock.sellStock(sym, shares);
            }
            
            if (forecast >= 0.6) {
                const cashAvailable = ns.getServerMoneyAvailable("home") - reserve;
                if (cashAvailable > 0) {
                    const maxShares = ns.stock.getMaxShares(sym);
                    const canBuy = Math.min(maxShares - shares, Math.floor(cashAvailable / ns.stock.getAskPrice(sym)));
                    
                    // Achat minimum de 5 millions pour éviter de saturer l'historique avec des micro-transactions
                    if (canBuy > 0 && (canBuy * ns.stock.getAskPrice(sym)) > 5e6) {
                        ns.stock.buyStock(sym, canBuy);
                    }
                }
            }
        }

        // Diffusion de la valeur pour le Dashboard ET le Pre-flight
        const packet = { value: Number(totalValue) || 0, active: Number(activePositions) || 0 };
        
        // Utilisation propre du PortHandler pour écraser l'ancienne valeur
        ph.clear(DATA_PORT);
        ph.writeJSON(DATA_PORT, packet);
    }
}