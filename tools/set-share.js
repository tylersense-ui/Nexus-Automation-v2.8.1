import { CONFIG } from "/lib/constants.js";
import { PortHandler } from "/core/port-handler.js";

/** * Nexus-Apex v44.0
 * Module: Tool - Set Share
 * Description: Outil de pilotage manuel du ratio de partage.
 * Logic: Écrit la consigne sur le port dédié que le Giga-Batcher écoute.
 * Usage: run /tools/set-share.js [0-100]
 */

/** @param {NS} ns **/
export async function main(ns) {
    const ratioStr = ns.args[0];
    if (ratioStr === undefined) {
        ns.tprint("❌ Usage: run tools/set-share.js [0-100]");
        return;
    }

    const ratio = parseInt(ratioStr) / 100;
    const SHARE_PORT = CONFIG.PORTS.SHARE_RATIO || 6;
    const ph = new PortHandler(ns);

    // Vider le port puis écrire la nouvelle valeur de manière atomique
    ph.clear(SHARE_PORT);
    const success = ph.writeJSON(SHARE_PORT, { shareRatio: ratio });

    if (success) {
        ns.tprint(`✅ Nexus-Apex : Ratio de Share réglé sur ${(ratio * 100).toFixed(0)}% du réseau.`);
    } else {
        ns.tprint("❌ Erreur : Impossible d'écrire sur le port (Bus saturé).");
    }
}