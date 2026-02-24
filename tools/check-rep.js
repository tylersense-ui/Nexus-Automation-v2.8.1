/** * Nexus-Apex v44.0
 * Module: Tool - Check Rep
 * Description: Simulateur d'achat basé sur une réputation cible.
 * Logic: Compare le JSON avec le paramètre de réputation injecté pour dire ce qui serait déblocable.
 * Usage: run /tools/check-rep.js [Reputation]
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(450, 300);

    const inputRep = ns.args[0];
    if (!inputRep) {
        ns.print("❌ Usage: run tools/check-rep.js [Reputation]");
        return;
    }

    let rep = parseFloat(inputRep);
    if (inputRep.toString().toLowerCase().includes("k")) rep *= 1000;
    if (inputRep.toString().toLowerCase().includes("m")) rep *= 1000000;

    const data = JSON.parse(ns.read("data/todo.json"));
    const myMoney = ns.getServerMoneyAvailable("home");

    ns.print(`┌── ANALYSE DE PROGRESSION (Rep: ${ns.formatNumber(rep)}) ──┐`);
    let canAffordAndUnlock = 0;
    let nextGoal = null;

    for (const aug of data.filter(a => !a.bought)) {
        const hasRep = rep >= aug.rep;
        const hasMoney = myMoney >= aug.price;
        if (hasRep && hasMoney) { ns.print(` ✅ UNLOCKED: ${aug.name}`); canAffordAndUnlock++; }
        else if (hasRep && !hasMoney) { ns.print(` 💰 BESOIN $: ${aug.name}`); }
        else if (!hasRep) { if (!nextGoal || aug.rep < nextGoal.rep) nextGoal = aug; }
    }

    ns.print(`├──────────────────────────────────────────┤`);
    if (canAffordAndUnlock >= 1) ns.print(` 🚀 VERDICT: ${canAffordAndUnlock} AUGMENTATIONS PRÊTES !`);
    else if (nextGoal) ns.print(` ⏳ PROCHAIN: ${nextGoal.name} (${ns.formatNumber(nextGoal.rep)})`);
    ns.print(`└──────────────────────────────────────────┘`);
}