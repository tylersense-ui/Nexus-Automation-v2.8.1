/** @param {NS} ns */
export async function main(ns) {
    const files = {
        // --- LIBRARIES ---
        "/lib/constants.js": `export const CONFIG = {
    PORTS: { NETWORK_MAP: 1, TARGET_QUEUE: 2, LOG_STREAM: 3, COMMANDS: 4 },
    HACKING: { MIN_SECURITY_THRESHOLD: 5, MAX_MONEY_PERCENTAGE: 0.90, BATCH_SPACING: 30, RESERVED_HOME_RAM: 32, PREFER_FORMULAS: true },
    MANAGERS: { PSERV_PREFIX: "nexus-node-", MAX_PSERV_RAM: 1048576, AUTO_JOIN_FACTIONS: true, UPGRADE_HOME_RAM_PRIORITY: 1 },
    COLORS: { INFO: "\\u001b[32m", WARN: "\\u001b[33m", ERROR: "\\u001b[31m", DEBUG: "\\u001b[36m", RESET: "\\u001b[0m" }
};`,

        "/lib/logger.js": `import { CONFIG } from "/lib/constants.js";
export class Logger {
    constructor(ns, moduleName) { this.ns = ns; this.module = moduleName.toUpperCase(); this.colors = CONFIG.COLORS; }
    info(msg) { this._print("INFO", this.colors.INFO, msg); }
    warn(msg) { this._print("WARN", this.colors.WARN, msg); }
    error(msg) { this._print("ERROR", this.colors.ERROR, msg); this.ns.toast(\`[\${this.module}] ERROR: \${msg}\`, "error", 5000); }
    _print(level, color, msg) {
        const timestamp = new Date().toLocaleTimeString();
        this.ns.print(\`\${color}[\${timestamp}] [\${this.module}] [\${level}] \${msg}\${this.colors.RESET}\`);
    }
    clear() { this.ns.clearLog(); }
}`,

        "/lib/capabilities.js": `export class Capabilities {
    constructor(ns) { this.ns = ns; this.update(); }
    update() {
        const check = (api) => { try { return this.ns[api] !== undefined; } catch { return false; } };
        this.singularity = check('singularity'); this.gang = check('gang'); this.corp = check('corporation');
        this.sleeve = check('sleeve'); this.formulas = this.ns.fileExists("Formulas.exe", "home");
        this.brutessh = this.ns.fileExists("BruteSSH.exe", "home"); this.ftpcrack = this.ns.fileExists("FTPCrack.exe", "home");
        this.relaysmtp = this.ns.fileExists("relaySMTP.exe", "home"); this.httpworm = this.ns.fileExists("HTTPWorm.exe", "home");
        this.sqlinject = this.ns.fileExists("SQLInject.exe", "home");
        this.crackLevel = [this.brutessh, this.ftpcrack, this.relaysmtp, this.httpworm, this.sqlinject].filter(Boolean).length;
    }
}`,

        "/lib/network.js": `import { CONFIG } from "/lib/constants.js";
export class Network {
    constructor(ns, caps) { this.ns = ns; this.caps = caps; }
    refresh() {
        const servers = new Set(["home"]);
        const scanFolder = (host) => { this.ns.scan(host).forEach(h => { if (!servers.has(h)) { servers.add(h); scanFolder(h); } }); };
        scanFolder("home"); return Array.from(servers);
    }
    crack(host) {
        if (this.ns.hasRootAccess(host)) return true;
        if (this.caps.brutessh) this.ns.brutessh(host); if (this.caps.ftpcrack) this.ns.ftpcrack(host);
        if (this.caps.relaysmtp) this.ns.relaysmtp(host); if (this.caps.httpworm) this.ns.httpworm(host);
        if (this.caps.sqlinject) this.ns.sqlinject(host);
        try { this.ns.nuke(host); } catch {} return this.ns.hasRootAccess(host);
    }
    calculateScore(host) {
        const s = this.ns.getServer(host); if (host === "home" || s.purchasedByPlayer || s.moneyMax === 0) return 0;
        if (s.requiredHackingSkill > this.ns.getHackingLevel()) return 0;
        return s.moneyMax / s.minDifficulty;
    }
    getBestTarget() {
        let best = "n00dles", maxS = 0;
        this.refresh().forEach(h => { if (this.crack(h)) { const s = this.calculateScore(h); if (s > maxS) { maxS = s; best = h; } } });
        return best;
    }
}`,

        // --- CORE ---
        "/core/ram-manager.js": `import { CONFIG } from "/lib/constants.js";
export class RamManager {
    constructor(ns) { this.ns = ns; }
    getGlobalRam(list) {
        let t = 0, u = 0;
        list.forEach(h => { if (this.ns.hasRootAccess(h)) { let m = this.ns.getServerMaxRam(h); if (h === "home") m = Math.max(0, m - CONFIG.HACKING.RESERVED_HOME_RAM); t += m; u += this.ns.getServerUsedRam(h); } });
        return { total: t, used: u, free: Math.max(0, t - u) };
    }
    findBestHost(list, ram) {
        for (const h of list) { if (this.ns.hasRootAccess(h)) { let a = this.ns.getServerMaxRam(h) - this.ns.getServerUsedRam(h); if (h === "home") a -= CONFIG.HACKING.RESERVED_HOME_RAM; if (a >= ram) return h; } }
        return null;
    }
}`,

        "/core/port-handler.js": `export class PortHandler {
    constructor(ns) { this.ns = ns; }
    write(p, d) { return this.ns.tryWritePort(p, JSON.stringify(d)); }
    peek(p) { const d = this.ns.peekPort(p); return d === "NULL PORT DATA" ? null : JSON.parse(d); }
}`,

        "/core/orchestrator.js": `import { Logger } from "/lib/logger.js";
import { Capabilities } from "/lib/capabilities.js";
import { Network } from "/lib/network.js";
import { RamManager } from "/core/ram-manager.js";
import { PortHandler } from "/core/port-handler.js";
import { CONFIG } from "/lib/constants.js";

export async function main(ns) {
    ns.disableLog("ALL"); const log = new Logger(ns, "ORCHESTRATOR");
    const caps = new Capabilities(ns); const net = new Network(ns, caps);
    const ram = new RamManager(ns); const ports = new PortHandler(ns);

    while (true) {
        caps.update(); const networkList = net.refresh();
        networkList.forEach(h => net.crack(h));
        const best = net.getBestTarget();
        ports.write(CONFIG.PORTS.TARGET_QUEUE, { target: best });

        const mods = [
            ["/managers/server-manager.js", "Server"], ["/hack/controller.js", "Hack"],
            ["/hack/watcher.js", "Watcher"], ["/ui/dashboard.js", "UI"]
        ];
        if (caps.singularity) mods.push(["/managers/singularity.js", "Singularity"]);
        if (caps.gang) mods.push(["/managers/gang-manager.js", "Gang"]);
        if (caps.sleeve) mods.push(["/managers/sleeve-manager.js", "Sleeve"]);
        if (caps.corp) mods.push(["/managers/corp-manager.js", "Corp"]);

        for (const [path, name] of mods) {
            if (ns.fileExists(path) && !ns.scriptRunning(path, "home")) ns.run(path, 1);
        }
        await ns.asleep(30000);
    }
}`,

        // --- MANAGERS & HACK ---
        "/hack/workers/hack.js": `export async function main(ns) { await ns.hack(ns.args[0]); }`,
        "/hack/workers/grow.js": `export async function main(ns) { await ns.grow(ns.args[0]); }`,
        "/hack/workers/weaken.js": `export async function main(ns) { await ns.weaken(ns.args[0]); }`,

        "/hack/controller.js": `import { PortHandler } from "/core/port-handler.js";
import { RamManager } from "/core/ram-manager.js";
import { CONFIG } from "/lib/constants.js";
export async function main(ns) {
    const ports = new PortHandler(ns); const ram = new RamManager(ns);
    while(true) {
        const data = ports.peek(CONFIG.PORTS.TARGET_QUEUE);
        if(!data) { await ns.asleep(5000); continue; }
        const t = data.target;
        const host = ram.findBestHost(ns.scan("home"), 2);
        if(host) ns.exec("/hack/workers/weaken.js", host, 1, t);
        await ns.asleep(1000);
    }
}`,

        "/managers/corp-manager.js": `import { Logger } from "/lib/logger.js";
export async function main(ns) {
    ns.disableLog("ALL"); const log = new Logger(ns, "CORP");
    if (!ns.corporation.hasCorporation()) return;
    while (true) {
        const corp = ns.corporation.getCorporation();
        for (const divName of corp.divisions) {
            const div = ns.corporation.getDivision(divName);
            for (const city of div.cities) {
                const office = ns.corporation.getOffice(divName, city);
                if (office.numEmployees < office.size) ns.corporation.hireEmployee(divName, city);
            }
        }
        await ns.asleep(60000);
    }
}`,

        "/ui/dashboard.js": `export async function main(ns) {
    const doc = eval("document");
    const h = doc.getElementById('overview-extra-hook-1');
    ns.atExit(() => h.innerText = "");
    while(true) {
        h.innerText = "Nexus Online\\nProfit: " + ns.formatMoney(ns.getScriptIncome()[0]) + "/s";
        await ns.asleep(1000);
    }
}`,

        "boot.js": `export async function main(ns) {
    ns.ps("home").forEach(p => { if (p.filename !== ns.getScriptName()) ns.kill(p.pid); });
    await ns.asleep(1000);
    ns.run("/core/orchestrator.js", 1);
    ns.tprint("Nexus OS Initialized.");
}`
    };

    ns.tprint("🚀 Start Nexus-Automation Professional Install...");
    for (const [path, content] of Object.entries(files)) {
        await ns.write(path, content, "w");
        ns.tprint(`✅ Installed: ${path}`);
    }
    ns.tprint("🎉 Done. Run 'run boot.js'");
}