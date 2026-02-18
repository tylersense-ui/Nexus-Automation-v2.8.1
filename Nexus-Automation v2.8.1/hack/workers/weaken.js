/** @param {NS} ns */
export async function main(ns) {
    if (ns.args[1]) await ns.asleep(ns.args[1]);
    await ns.weaken(ns.args[0]);
}