/** @param {NS} ns */
export async function main(ns) {
    // ns.args[0] = cible, ns.args[1] = sleep initial (pour le batching futur)
    if (ns.args[1]) await ns.asleep(ns.args[1]);
    await ns.hack(ns.args[0]);
}