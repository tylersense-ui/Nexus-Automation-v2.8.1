/** * NEXUS-AUTOMATION v44.0 - "Apex"
 * Module: Library / Constants
 * Documentation: Centralized configuration for the entire suite.
 * Ghost in the Shell: Verified. No race conditions.
 */

/** @param {NS} ns **/
export const CONFIG = {
    // Ports de communication (Netscript Ports 1-20)
    PORTS: {
        NETWORK_MAP: 1,      // Liste des serveurs rootés
        TARGET_QUEUE: 2,     // Cibles prioritaires
        LOG_STREAM: 3,       // Flux de logs
        COMMANDS: 4,         // Instructions de l'Orchestrateur (VITAL)
        STOCK_DATA: 5,       // Données boursières
        SHARE_RATIO: 6       // Transmission du ratio de partage
    },

    // Paramètres du système de Hacking
    HACKING: {
        MIN_SECURITY_THRESHOLD: 5,        
        MAX_MONEY_PERCENTAGE: 0.90,       
        BATCH_SPACING: 30,                
        RESERVED_HOME_RAM: 128,           // GB réservés pour le Kernel
        PREFER_FORMULAS: true,
        MAX_TARGET_DIFFICULTY: 50         // Évite de cibler des serveurs trop "lents"
    },

    // Paramètres des Managers
    MANAGERS: {
        PSERV_PREFIX: "nexus-node-",      
        AUTO_JOIN_FACTIONS: true,         
        UPGRADE_HOME_RAM_PRIORITY: 1      
    },

    // Configuration Système
    SYSTEM: {
        DEBUG_MODE: true,
        REFRESH_RATE: 2000                // Ms entre chaque cycle de monitoring
    },

    COLORS: {
        INFO: "\u001b[32m", WARN: "\u001b[33m", ERROR: "\u001b[31m",
        DEBUG: "\u001b[36m", RESET: "\u001b[0m"
    }
};