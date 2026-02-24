/** * Nexus-Apex v44.0
 * Module: Worker - Share
 * Description: Script de partage de puissance de calcul pour le boost de réputation de faction.
 * Logic: Boucle infinie courte pour maintenir le thread actif.
 * Usage: Lancé uniquement par le Controller en fonction du SHARE_RATIO.
 * @param {string} target - "network" par défaut (args[0], ignoré)
 * @param {number} delay - Délai de départ (args[1], ignoré)
 * @param {number} salt - Identifiant unique pour le multi-threading (args[2], ignoré)
 */
export async function main(ns) {
    while (true) {
        await ns.share();
    }
}