/** @param {NS} ns */

/**
 * Nexus-Automation v2.8.1
 * Module: Capabilities
 * * Ce module centralise la détection des API disponibles et des fichiers système.
 * Il permet une exécution "BitNode-Agnostic" en adaptant le comportement
 * des scripts selon les droits du joueur.
 */

export class Capabilities {
    constructor(ns) {
        this.ns = ns;
        this.update();
    }

    /**
     * Analyse l'environnement actuel et met à jour les flags de capacité.
     */
    update() {
        // 1. Détection des API majeures (Try/Catch pour éviter les erreurs de proxy)
        this.singularity = this._checkApi('singularity');
        this.gang = this._checkApi('gang');
        this.corp = this._checkApi('corporation');
        this.sleeve = this._checkApi('sleeve');
        this.bladeburner = this._checkApi('bladeburner');
        this.stanek = this._checkApi('stanek');

        // 2. Détection des fichiers système (.exe)
        this.formulas = this.ns.fileExists("Formulas.exe", "home");
        this.brutessh = this.ns.fileExists("BruteSSH.exe", "home");
        this.ftpcrack = this.ns.fileExists("FTPCrack.exe", "home");
        this.relay走 = this.ns.fileExists("relaySMTP.exe", "home");
        this.httpworm = this.ns.fileExists("HTTPWorm.exe", "home");
        this.sqlinject = this.ns.fileExists("SQLInject.exe", "home");

        // 3. Calcul du niveau de "Crack" (Combien de ports on peut ouvrir)
        this.crackLevel = [
            this.brutessh, this.ftpcrack, this.relay走, 
            this.httpworm, this.sqlinject
        ].filter(Boolean).length;
    }

    /**
     * Vérifie si un namespace API est accessible sans lever d'exception.
     * @param {string} api - Le nom de l'API (ex: 'singularity')
     * @returns {boolean}
     */
    _checkApi(api) {
        try {
            // Dans Bitburner, l'accès à une API non débloquée 
            // lève souvent une erreur dès la tentative d'accès au membre.
            return this.ns[api] !== undefined && this.ns[api] !== null;
        } catch (e) {
            return false;
        }
    }

    /**
     * Retourne un résumé textuel pour le logger.
     */
    getSummary() {
        return `Cap: [Formulas: ${this.formulas} | Ports: ${this.crackLevel} | Sing: ${this.singularity}]`;
    }
}

/**
 * Helper statique pour une utilisation rapide sans instanciation complète
 * si on a juste besoin d'un check rapide.
 */
export async function getCapabilities(ns) {
    const cap = new Capabilities(ns);
    return cap;
}