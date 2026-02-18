/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    const WORKER_PATH = "hack/workers/";
    
    while (true) {
        let hosts = ["home"];
        let potentialTargets = [];

        // 1. SCAN, NUKE ET FILTRE
        for (let i = 0; i < hosts.length; i++) {
            for (let res of ns.scan(hosts[i])) {
                if (!hosts.includes(res)) {
                    hosts.push(res);
                    if (!ns.hasRootAccess(res)) {
                        if (ns.fileExists("BruteSSH.exe")) ns.brutessh(res);
                        if (ns.fileExists("FTPCrack.exe")) ns.ftpcrack(res);
                        if (ns.fileExists("relaySMTP.exe")) ns.relaysmtp(res);
                        if (ns.fileExists("HTTPWorm.exe")) ns.httpworm(res);
                        if (ns.fileExists("SQLInject.exe")) ns.sqlinject(res);
                        try { ns.nuke(res); } catch(e) {}
                    }
                    
                    if (ns.hasRootAccess(res) && ns.getServerMaxMoney(res) > 0) {
                        let reqLevel = ns.getServerRequiredHackingLevel(res);
                        let wTime = ns.getWeakenTime(res);
                        // On ne prend que ce qu'on peut hacker ET qui prend moins de 15 min (900s)
                        if (reqLevel <= ns.getHackingLevel() && wTime < 900000) {
                            potentialTargets.push(res);
                        }
                    }
                }
            }
        }

        // 2. CIBLE PRIORITAIRE : THE-HUB (ou la plus riche sous 15min)
        let target = "phantasy";
        let maxMoney = 0;
        
        for (let t of potentialTargets) {
            let m = ns.getServerMaxMoney(t);
            // "the-hub" est notre cible de prédilection à ton niveau
            if (t === "the-hub") { target = t; break; } 
            if (m > maxMoney) {
                maxMoney = m;
                target = t;
            }
        }

        // 3. DÉPLOIEMENT ÉCLAIR
        for (const host of hosts) {
            if (!ns.hasRootAccess(host)) continue;
            if (ns.ps(host).some(p => p.filename.includes(".js") && !p.filename.includes("orchestrator"))) continue;

            let freeRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
            if (host === "home") freeRam -= 40;
            if (freeRam < 1.75) continue;

            let threads = Math.floor(freeRam / 1.75);
            let s = ns.getServerSecurityLevel(target);
            let m = ns.getServerMinSecurityLevel(target);
            let mon = ns.getServerMoneyAvailable(target);
            let maxMon = ns.getServerMaxMoney(target);
            
            if (s > m + 0.1) {
                ns.exec(WORKER_PATH + "weaken.js", host, threads, target, 0);
            } else if (mon < maxMon * 0.9) {
                ns.exec(WORKER_PATH + "grow.js", host, threads, target, 0);
            } else {
                let hThreads = Math.min(threads, Math.max(1, Math.floor(ns.hackAnalyzeThreads(target, mon * 0.5))));
                if (hThreads > 0) ns.exec(WORKER_PATH + "hack.js", host, hThreads, target, 0);
            }
        }
        await ns.asleep(2000);
    }
}