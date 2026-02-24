import { CONFIG } from "/lib/constants.js";

/** * NEXUS-AUTOMATION v44.0 - "Apex"
 * Module: Library / Network
 * Documentation: Scanner, Cracker and Target Scoring system.
 * Usage: const net = new Network(ns, caps);
 */

export class Network {
    /** @param {NS} ns @param {Capabilities} caps **/
    constructor(ns, caps) {
        this.ns = ns;
        this.caps = caps;
    }

    /** Scan récursif pour cartographier le réseau */
    refresh() {
        let servers = ["home"];
        for (let i = 0; i < servers.length; i++) {
            let neighbors = this.ns.scan(servers[i]);
            for (let next of neighbors) {
                if (!servers.includes(next)) servers.push(next);
            }
        }
        return servers;
    }

    /** Calcule le score de rentabilité d'une cible */
    calculateScore(hostname) {
        const s = this.ns.getServer(hostname);
        const player = this.ns.getPlayer();

        if (hostname === "home" || s.purchasedByPlayer || s.moneyMax === 0) return 0;
        if (s.requiredHackingSkill > player.skills.hacking) return 0;

        // Protection contre les cibles trop lentes (limite via constants.js)
        if (s.minDifficulty > CONFIG.HACKING.MAX_TARGET_DIFFICULTY) return 0;

        let weight = s.moneyMax / s.minDifficulty;

        if (this.caps.formulas) {
            const t = this.ns.formulas.hacking.weakenTime(s, player);
            return (s.moneyMax / t);
        }
        return weight;
    }

    /** Tente d'ouvrir tous les ports et de NUKE */
    crack(hostname) {
        if (this.ns.hasRootAccess(hostname)) return true;

        if (this.caps.brutessh) this.ns.brutessh(hostname);
        if (this.caps.ftpcrack) this.ns.ftpcrack(hostname);
        if (this.caps.relaysmtp) this.ns.relaysmtp(hostname);
        if (this.caps.httpworm) this.ns.httpworm(hostname);
        if (this.caps.sqlinject) this.ns.sqlinject(hostname);

        try {
            this.ns.nuke(hostname);
            return true;
        } catch (e) {
            return false;
        }
    }

    /** Retourne la cible #1 */
    getBestTarget() {
        const top = this.getTopTargets(1);
        return top.length > 0 ? top[0] : "n00dles";
    }

    /** Récupère les X meilleures cibles pour le multi-threading */
    getTopTargets(count = 5) {
        const allServers = this.refresh();
        let targets = [];

        for (const host of allServers) {
            const score = this.calculateScore(host);
            if (score > 0) targets.push({ name: host, score: score });
        }

        return targets
            .sort((a, b) => b.score - a.score)
            .slice(0, count)
            .map(t => t.name);
    }
}