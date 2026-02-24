/** * Nexus-Apex v44.0
 * Module: Port Handler
 * Description: Bus de communication inter-scripts sécurisé.
 * Logic: Encapsulation du JSON et protection contre les race conditions avec tryWritePort.
 * Usage: import { PortHandler } from "/core/port-handler.js"; const ph = new PortHandler(ns);
 */

export class PortHandler {
    /**
     * @param {NS} ns 
     */
    constructor(ns) {
        this.ns = ns;
    }

    /** @param {number} portId @returns {string} */
    peek(portId) { return this.ns.peek(portId); }
    
    /** @param {number} portId @returns {string} */
    read(portId) { return this.ns.readPort(portId); }
    
    /**
     * Utilisation de tryWritePort (Ghost in the Shell fix) pour éviter les deadlocks si le port est plein.
     * @param {number} portId 
     * @param {any} data 
     * @returns {boolean}
     */
    write(portId, data) { return this.ns.tryWritePort(portId, data); }
    
    /** @param {number} portId */
    clear(portId) { this.ns.clearPort(portId); }
    
    /** @param {number} portId @returns {boolean} */
    isEmpty(portId) { return this.ns.peek(portId) === "NULL PORT DATA"; }

    /**
     * Écrit un objet proprement sur un port.
     * @param {number} portId 
     * @param {Object} obj 
     * @returns {boolean} Succès de l'écriture
     */
    writeJSON(portId, obj) {
        return this.write(portId, JSON.stringify(obj));
    }

    /**
     * Lit un objet sur un port avec sécurité anti-crash.
     * @param {number} portId 
     * @returns {Object|null}
     */
    readJSON(portId) {
        const data = this.read(portId);
        if (data === "NULL PORT DATA" || !data) return null;
        try {
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    }
}

/** @param {NS} ns */
export async function main(ns) {
    ns.tprint("✅ Nexus-Apex : Bibliothèque PortHandler chargée et opérationnelle.");
}