/** * NEXUS-AUTOMATION v44.0 - "Apex"
 * Module: Library / Capabilities
 * Documentation: Auto-detection of player tools and API access.
 * Usage: const caps = new Capabilities(ns);
 */

export class Capabilities {
    /** @param {NS} ns **/
    constructor(ns) {
        this.ns = ns;
        this.update();
    }

    /** Met à jour les accès en temps réel */
    update() {
        const ns = this.ns;
        // Logiciels de crack
        this.brutessh = ns.fileExists("BruteSSH.exe", "home");
        this.ftpcrack = ns.fileExists("FTPCrack.exe", "home");
        this.relaysmtp = ns.fileExists("relaySMTP.exe", "home");
        this.httpworm = ns.fileExists("HTTPWorm.exe", "home");
        this.sqlinject = ns.fileExists("SQLInject.exe", "home");

        // Bourse
        this.tix = false;
        this.has4S = false;
        try {
            if (ns.stock) {
                this.tix = ns.stock.hasTIXAPIAccess();
                this.has4S = ns.stock.has4SDataAPIAccess();
            }
        } catch (e) {}

        // APIs Spéciales
        this.formulas = ns.fileExists("Formulas.exe", "home");
        this.singularity = false;
        try {
            // Test non-bloquant pour vérifier l'accès Singularity
            ns.singularity.getCurrentWork();
            this.singularity = true;
        } catch (e) {}
    }
}