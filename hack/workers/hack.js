/** * Nexus-Apex v44.0
 * Module: Worker - Hack
 * Description: Script atomique de prélèvement d'argent.
 * Logic: Attend le délai spécifié (pour la synchronisation HWGW) puis pirate.
 * Usage: Lancé uniquement par le Controller.
 * @param {string} target - Cible à pirater (args[0])
 * @param {number} delay - Temps d'attente en millisecondes (args[1])
 * @param {number} salt - Identifiant unique pour le multi-threading (args[2], ignoré dans le code)
 */
export async function main(ns) {
    const [target, delay] = ns.args;
    if (delay > 0) await ns.asleep(delay);
    await ns.hack(target);
}