/** @param {NS} ns */
export class PortHandler {
    constructor(ns) {
        this.ns = ns;
    }

    /**
     * Lit la donnée au sommet du port sans la supprimer.
     * @param {number} portId - L'ID du port (défini dans constants.js)
     * @returns {any} La donnée présente sur le port
     */
    peek(portId) {
        // Utilisation de peekPort pour éviter la confusion avec les fichiers
        return this.ns.peek(portId);
    }

    /**
     * Lit et supprime la donnée du port.
     * @param {number} portId
     * @returns {any}
     */
    read(portId) {
        return this.ns.readPort(portId);
    }

    /**
     * Écrit une donnée sur le port.
     * @param {number} portId
     * @param {any} data
     */
    write(portId, data) {
        // Utilisation explicite de writePort pour éviter l'erreur "filename expected"
        return this.ns.writePort(portId, data);
    }

    /**
     * Vide intégralement un port.
     * @param {number} portId
     */
    clear(portId) {
        this.ns.clearPort(portId);
    }

    /**
     * Vérifie si un port est vide.
     * @param {number} portId
     * @returns {boolean}
     */
    isEmpty(portId) {
        return this.ns.peek(portId) === "NULL PORT DATA";
    }
}

/** @param {NS} ns */
export async function main(ns) {
    ns.tprint("PortHandler: Ce script est une bibliothèque et ne doit pas être exécuté seul.");
}