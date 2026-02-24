/** * NEXUS-AUTOMATION v44.0 - "Apex"
 * Module: Library / Capabilities
 * Documentation: Auto-detection of player tools and API access.
 * Usage: const caps = new Capabilities(ns);
 */

export class Capabilities {
    /** @param {NS} ns **/
    constructor(ns) {
        this.ns = ns;
        // ✅ FIX : Cache pour la détection Singularity (évite un try/catch coûteux à chaque update())
        this._singularityDetected = null;
        this.update();
    }

    /** Met à jour les accès en temps réel */
    update() {
        const ns = this.ns;

        // Logiciels de crack
        this.brutessh  = ns.fileExists("BruteSSH.exe",  "home");
        this.ftpcrack  = ns.fileExists("FTPCrack.exe",  "home");
        this.relaysmtp = ns.fileExists("relaySMTP.exe", "home");
        this.httpworm  = ns.fileExists("HTTPWorm.exe",  "home");
        this.sqlinject = ns.fileExists("SQLInject.exe", "home");

        // Bourse
        this.tix   = false;
        this.has4S = false;
        try {
            if (ns.stock) {
                this.tix   = ns.stock.hasTIXAPIAccess();
                this.has4S = ns.stock.has4SDataAPIAccess();
            }
        } catch (e) {}

        // Formulas
        this.formulas = ns.fileExists("Formulas.exe", "home");

        // ✅ FIX : Test Singularity uniquement si pas encore détecté (résultat mis en cache)
        if (this._singularityDetected === null) {
            try {
                ns.singularity.getCurrentWork();
                this._singularityDetected = true;
            } catch (e) {
                this._singularityDetected = false;
            }
        }
        this.singularity = this._singularityDetected;
    }
}
