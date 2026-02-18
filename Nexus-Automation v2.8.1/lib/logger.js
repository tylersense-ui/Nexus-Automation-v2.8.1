import { CONFIG } from "/lib/constants.js";

/** * Nexus-Automation v2.8.1
 * Module: Logger
 */

export class Logger {
    constructor(ns, moduleName) {
        this.ns = ns;
        this.module = moduleName.toUpperCase();
        this.colors = CONFIG.COLORS;
    }

    /**
     * Log une information générale (Vert)
     */
    info(msg) {
        this._print("INFO", this.colors.INFO, msg);
    }

    /**
     * Log un avertissement (Jaune)
     */
    warn(msg) {
        this._print("WARN", this.colors.WARN, msg);
    }

    /**
     * Log une erreur critique (Rouge)
     */
    error(msg) {
        this._print("ERROR", this.colors.ERROR, msg);
        this.ns.toast(`[${this.module}] ERROR: ${msg}`, "error", 5000);
    }

    /**
     * Log de debug (Cyan) - Visible seulement si activé
     */
    debug(msg) {
        this._print("DEBUG", this.colors.DEBUG, msg);
    }

    /**
     * Méthode interne de formatage
     */
    _print(level, color, msg) {
        const timestamp = new Date().toLocaleTimeString();
        const output = `${color}[${timestamp}] [${this.module}] [${level}] ${msg}${this.colors.RESET}`;
        this.ns.print(output);
        
        // Optionnel : Envoyer également sur un port de log centralisé
        // this.ns.tryWritePort(CONFIG.PORTS.LOG_STREAM, output);
    }

    /**
     * Nettoie le terminal du script actuel
     */
    clear() {
        this.ns.clearLog();
    }
}