/** * Nexus-Apex v44.0
 * Module: Worker - Weaken
 * Description: Script atomique de réduction de sécurité.
 * Logic: Attend le délai spécifié (pour la synchronisation HWGW) puis affaiblit la cible.
 * Usage: Lancé uniquement par le Controller.
 * @param {string} target - Cible à affaiblir (args[0])
 * @param {number} delay - Temps d'attente en millisecondes (args[1])
 * @param {number} salt - Identifiant unique pour le multi-threading (args[2], ignoré)
 */
export async function main(ns) {
    const [target, delay] = ns.args;
    if (delay > 0) await ns.asleep(delay);
    await ns.weaken(target);
}