/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    const target = "phantasy";
    const WORKERS = ["hack/workers/hack.js", "hack/workers/grow.js", "hack/workers/weaken.js"];

    function getNodes() {
        let nodes = ["home"];
        for (let i = 0; i < nodes.length; i++) {
            for (let n of ns.scan(nodes[i])) if (!nodes.includes(n)) nodes.push(n);
        }
        return nodes.filter(n => ns.hasRootAccess(n) && ns.getServerMaxRam(n) > 0);
    }

    const execDist = (script, threads, delay, nodes) => {
        let remaining = threads;
        for (const node of nodes) {
            let free = ns.getServerMaxRam(node) - ns.getServerUsedRam(node);
            if (node === "home") free -= 100;
            let canRun = Math.floor(free / 1.75);
            if (canRun > 0) {
                let toRun = Math.min(remaining, canRun);
                ns.exec(script, node, toRun, target, delay, Math.random());
                remaining -= toRun;
            }
            if (remaining <= 0) break;
        }
    };

    while (true) {
        const nodes = getNodes();
        const s = ns.getServer(target);
        const p = ns.getPlayer();

        // On s'assure que les workers sont partout
        for (const node of nodes) if (node !== "home") await ns.scp(WORKERS, node);

        const hThreads = Math.max(1, Math.floor(ns.hackAnalyzeThreads(target, s.moneyMax * 0.10))); // On prend 10% par vague
        const gThreads = Math.ceil(ns.growthAnalyze(target, 1.15) * 1.1);
        const w1Threads = Math.ceil(hThreads * 0.04 / 0.05) + 2;
        const w2Threads = Math.ceil(gThreads * 0.06 / 0.05) + 2;

        const hTime = ns.getHackTime(target);
        const wTime = hTime * 4;
        const gTime = hTime * 3.2;
        const offset = 80;

        if (s.hackDifficulty > s.minDifficulty + 2 || s.moneyAvailable < s.moneyMax * 0.90) {
            // Mode Prep si Phantasy est malmenée
            execDist(WORKERS[2], 500, 0, nodes);
            execDist(WORKERS[1], 2000, 0, nodes);
            await ns.asleep(2000);
        } else {
            // Batching HWGW pur
            execDist(WORKERS[0], hThreads, wTime - hTime - offset, nodes);
            execDist(WORKERS[2], w1Threads, 0, nodes);
            execDist(WORKERS[1], gThreads, wTime - gTime + offset, nodes);
            execDist(WORKERS[2], w2Threads, offset * 2, nodes);
            await ns.asleep(offset * 4);
        }
    }
}