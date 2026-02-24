import { CONFIG } from "/lib/constants.js";
import { Network } from "/lib/network.js";
import { Capabilities } from "/lib/capabilities.js";
import { PortHandler } from "/core/port-handler.js";

/** * Nexus-Apex v44.0
 * Module: GIGA-BATCHER
 * Description: Moteur de profit HWGW (Hack/Weaken/Grow/Weaken) ultra-synchronisé.
 * Logic: Calcule les délais, distribue dynamiquement les threads et gère le port de share.
 * Usage: Lancé par l'Orchestrateur automatiquement. (run /core/batcher.js)
 */
export async function main(ns) {
    ns.disableLog("ALL");
    const caps = new Capabilities(ns);
    const net = new Network(ns, caps);
    const ph = new PortHandler(ns);
    
    // Sécurisation Apex : On utilise la constante de configuration si elle existe, sinon 6.
    const SHARE_PORT = CONFIG.PORTS.SHARE_RATIO || 6;
    const spacer = CONFIG.HACKING.BATCH_SPACING;
    
    let lastRatio = 0;

    ns.tprint(`🚀 Nexus Giga-Batcher Apex v44.0 : Système de commande synchronisé`);

    while (true) {
        let currentRatio = lastRatio;
        let foundNewData = false;

        // Vider proprement le port VIA PORT-HANDLER (Plus de ns.read qui crée des fichiers !)
        while (!ph.isEmpty(SHARE_PORT)) {
            const config = ph.readJSON(SHARE_PORT);
            if (config && config.shareRatio !== undefined) {
                currentRatio = Number(config.shareRatio);
                foundNewData = true;
            }
        }

        if (foundNewData) {
            ph.writeJSON(SHARE_PORT, { shareRatio: currentRatio });
        }

        const nodes = net.refresh()
            .filter(n => ns.hasRootAccess(n))
            .sort((a, b) => a === "home" ? -1 : b === "home" ? 1 : 0);

        // LOGIQUE DE NETTOYAGE RADICAL
        if (currentRatio !== lastRatio) {
            ns.tprint(`🔄 Nexus : Changement de Ratio détecté (${(lastRatio * 100).toFixed(0)}% -> ${(currentRatio * 100).toFixed(0)}%)`);
            
            for (const node of nodes) {
                const processes = ns.ps(node);
                for (const p of processes) {
                    const isProfit = ["hack.js", "grow.js", "weaken.js"].some(f => p.filename.toLowerCase().includes(f));
                    const isShare = p.filename.toLowerCase().includes("share.js");

                    if (currentRatio > lastRatio && isProfit) ns.kill(p.pid);
                    if (currentRatio < lastRatio && isShare) ns.kill(p.pid);
                }
            }
            lastRatio = currentRatio;
        }

        // DÉPLOIEMENT DU SHARE
        if (currentRatio > 0) {
            for (const node of nodes) {
                let max = ns.getServerMaxRam(node);
                if (node === "home") max -= CONFIG.HACKING.RESERVED_HOME_RAM;
                
                let targetThreads = Math.floor((max * currentRatio) / 4.0);
                let currentThreads = 0;
                
                ns.ps(node).forEach(p => {
                    if (p.filename.includes("share.js")) currentThreads += p.threads;
                });

                if (currentThreads < targetThreads) {
                    let free = ns.getServerMaxRam(node) - ns.getServerUsedRam(node);
                    if (node === "home") free -= CONFIG.HACKING.RESERVED_HOME_RAM;
                    
                    let toSend = Math.min(targetThreads - currentThreads, Math.floor(free / 4.0));
                    if (toSend > 0) {
                        ph.writeJSON(CONFIG.PORTS.COMMANDS, { type: 'share', host: node, threads: toSend });
                    }
                }
            }
        }

        // GESTION DU PROFIT
        if (currentRatio < 1.0) {
            const targets = net.getTopTargets(5);
            for (const targetName of targets) {
                const server = ns.getServer(targetName);
                if (server.hackDifficulty <= server.minDifficulty + 0.1 && server.moneyAvailable >= server.moneyMax * 0.99) {
                    await dispatchHwgwBatch(ns, ph, nodes, server, spacer, currentRatio);
                } else {
                    await dispatchPreparation(ns, ph, nodes, server, currentRatio);
                }
            }
        }
        await ns.asleep(spacer * 5);
    }
}

/**
 * @param {NS} ns
 * @param {PortHandler} ph
 * @param {string[]} nodes
 * @param {Server} target
 * @param {number} ratio
 */
async function dispatchPreparation(ns, ph, nodes, target, ratio) {
    let secDiff = target.hackDifficulty - target.minDifficulty;
    for (const node of nodes) {
        let max = ns.getServerMaxRam(node);
        let limit = max * (1 - ratio);
        let usedByProfit = 0;
        ns.ps(node).forEach(p => {
            if (["hack.js", "grow.js", "weaken.js"].some(f => p.filename.includes(f))) usedByProfit += (p.threads * 1.75);
        });
        let freeForProfit = limit - usedByProfit;
        if (node === "home") freeForProfit -= CONFIG.HACKING.RESERVED_HOME_RAM;
        let threads = Math.floor(freeForProfit / 1.75);
        if (threads <= 0) continue;
        const type = (secDiff > 0.5) ? 'weaken' : 'grow';
        ph.writeJSON(CONFIG.PORTS.COMMANDS, { type: type, host: node, target: target.hostname, threads: threads });
        if (type === 'weaken') secDiff -= ns.weakenAnalyze(threads);
        if (secDiff <= 0) break;
    }
}

/**
 * @param {NS} ns
 * @param {PortHandler} ph
 * @param {string[]} nodes
 * @param {Server} target
 * @param {number} spacer
 * @param {number} ratio
 */
async function dispatchHwgwBatch(ns, ph, nodes, target, spacer, ratio) {
    const hackPercent = 0.10;
    const hThreads = Math.max(1, Math.floor(ns.hackAnalyzeThreads(target.hostname, target.moneyMax * hackPercent)));
    const w1Threads = Math.ceil(ns.hackAnalyzeSecurity(hThreads) / 0.05);
    const gThreads = Math.ceil(ns.growthAnalyze(target.hostname, 1 / (1 - hackPercent)));
    const w2Threads = Math.ceil(ns.growthAnalyzeSecurity(gThreads) / 0.05);
    const batch = [{type:'hack',t:hThreads,d:0},{type:'weaken',t:w1Threads,d:spacer},{type:'grow',t:gThreads,d:spacer*2},{type:'weaken',t:w2Threads,d:spacer*3}];
    let nodeIdx = 0;
    for (const job of batch) {
        let remaining = job.t;
        while (remaining > 0 && nodeIdx < nodes.length) {
            let node = nodes[nodeIdx];
            let max = ns.getServerMaxRam(node);
            let limit = max * (1 - ratio);
            let free = Math.min(limit, max - ns.getServerUsedRam(node));
            if (node === "home") free -= CONFIG.HACKING.RESERVED_HOME_RAM;
            let possible = Math.floor(free / 1.75);
            if (possible <= 0) { nodeIdx++; continue; }
            let toSend = Math.min(remaining, possible);
            ph.writeJSON(CONFIG.PORTS.COMMANDS, { type: job.type, host: node, target: target.hostname, threads: toSend, delay: job.d });
            remaining -= toSend;
            if (remaining > 0) nodeIdx++;
        }
    }
}