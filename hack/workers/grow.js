/** * Nexus-Apex v44.0
 * Module: Worker - Grow
 * Description: Script atomique de croissance financière.
 * Logic: Attend le délai spécifié (pour la synchronisation HWGW) puis injecte de l'argent.
 * Usage: Lancé uniquement par le Controller.
 * @param {string} target - Cible à faire croître (args[0])
 * @param {number} delay - Temps d'attente en millisecondes (args[1])
 * @param {number} salt - Identifiant unique pour le multi-threading (args[2], ignoré)
 */
export async function main(ns) {
    const [target, delay] = ns.args;
    if (delay > 0) await ns.asleep(delay);
    await ns.grow(target);
}