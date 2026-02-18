import { CONFIG } from "/lib/constants.js";

/** * Nexus-Automation v2.8.1
 * Module: Network Utility
 */

export class Network {
    constructor(ns, caps) {
        this.ns = ns;
        this.caps = caps; // Instance de Capabilities
    }

    /**
     * Scan complet du réseau pour récupérer tous les noms de serveurs.
     * @returns {string[]} Liste unique de tous les serveurs.
     */
    refresh() {
        const servers = new Set(["home"]);
        const scanFolder = (hostname) => {
            this.ns.scan(hostname).forEach(host => {
                if (!servers.has(host)) {
                    servers.add(host);
                    scanFolder(host);
                }
            });
        };
        scanFolder("home");
        return Array.from(servers);
    }

    /**
     * Tente d'ouvrir les ports et de rooter un serveur.
     * @param {string} hostname 
     * @returns {boolean} True si le serveur est rooté.
     */
    crack(hostname) {
        if (this.ns.hasRootAccess(hostname)) return true;

        const server = this.ns.getServer(hostname);
        if (this.caps.brutessh) this.ns.brutessh(hostname);
        if (this.caps.ftpcrack) this.ns.ftpcrack(hostname);
        if (this.caps.relay走) this.ns.relaysmtp(hostname);
        if (this.caps.httpworm) this.ns.httpworm(hostname);
        if (this.caps.sqlinject) this.ns.sqlinject(hostname);

        try {
            this.ns.nuke(hostname);
        } catch (e) {
            return false;
        }
        return this.ns.hasRootAccess(hostname);
    }

    /**
     * Analyse un serveur pour déterminer son "Score de Profit" (Money per Second).
     * @param {string} hostname 
     * @returns {number} Score (plus c'est haut, plus c'est rentable).
     */
    calculateScore(hostname) {
        const server = this.ns.getServer(hostname);
        const player = this.ns.getPlayer();

        // Ignorer les serveurs inutilisables
        if (hostname === "home" || server.purchasedByPlayer || server.moneyMax === 0) return 0;
        if (server.requiredHackingSkill > player.skills.hacking) return 0;

        // Formule de scoring de base (MoneyMax / MinSecurity)
        // Si Formulas est présent, on pourrait affiner avec le temps de cycle réel.
        let score = server.moneyMax / server.minDifficulty;

        if (this.caps.formulas) {
            // Ajustement optionnel si Formulas.exe est possédé
            const weakingTime = this.ns.formulas.hacking.weakenTime(server, player);
            score = (server.moneyMax * 0.5) / weakingTime; // Score basé sur 50% de vol théorique
        }

        return score;
    }

    /**
     * Récupère la meilleure cible actuelle du réseau.
     */
    getBestTarget() {
        const allServers = this.refresh();
        let bestTarget = "n00dles";
        let maxScore = 0;

        for (const host of allServers) {
            if (this.crack(host)) {
                const score = this.calculateScore(host);
                if (score > maxScore) {
                    maxScore = score;
                    bestTarget = host;
                }
            }
        }
        return bestTarget;
    }
}