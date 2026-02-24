import { CONFIG } from "/lib/constants.js";

/** * Nexus-Apex v44.0
 * Module: RAM Manager
 * Description: Optimisation de l'allocation mémoire sur le réseau.
 * Logic: Évalue la RAM globale et trouve les meilleurs hôtes pour l'exécution.
 * Usage: import { RamManager } from "/core/ram-manager.js";
 */
export class RamManager {
    /**
     * @param {NS} ns 
     */
    constructor(ns) {
        this.ns = ns;
    }

    /**
     * Calcule la RAM totale disponible sur l'ensemble du réseau rooté.
     * @param {string[]} networkList - Liste des serveurs fournie par Network.js
     * @returns {Object} { total, used, free } en GB.
     */
    getGlobalRam(networkList) {
        let total = 0;
        let used = 0;

        for (const host of networkList) {
            if (this.ns.hasRootAccess(host)) {
                const server = this.ns.getServer(host);
                let ramMax = server.maxRam;
                
                // Appliquer strictement la réserve sur 'home' d'après les constantes
                if (host === "home") {
                    ramMax = Math.max(0, ramMax - CONFIG.HACKING.RESERVED_HOME_RAM);
                }

                total += ramMax;
                used += server.ramUsed;
            }
        }

        return {
            total: total,
            used: used,
            free: Math.max(0, total - used)
        };
    }

    /**
     * Détermine sur quel serveur lancer un script en fonction de la RAM requise.
     * @param {string[]} networkList 
     * @param {number} ramRequired 
     * @returns {string|null} Le nom du serveur ou null si aucun n'a assez de place.
     */
    findBestHost(networkList, ramRequired) {
        for (const host of networkList) {
            if (this.ns.hasRootAccess(host)) {
                const server = this.ns.getServer(host);
                let available = server.maxRam - server.ramUsed;
                
                if (host === "home") available -= CONFIG.HACKING.RESERVED_HOME_RAM;

                if (available >= ramRequired) return host;
            }
        }
        return null;
    }

    /**
     * Calcule le nombre de threads maximum pour un script donné sur tout le réseau.
     * @param {string[]} networkList 
     * @param {string} scriptPath 
     * @returns {number}
     */
    calculateMaxThreads(networkList, scriptPath) {
        const cost = this.ns.getScriptRam(scriptPath);
        const global = this.getGlobalRam(networkList);
        return Math.floor(global.free / cost);
    }
}