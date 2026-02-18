/** * Nexus-Automation v2.8.1
 * Module: Constants
 */

export const CONFIG = {
    // Ports de communication (Netscript Ports 1-20)
    PORTS: {
        NETWORK_MAP: 1,      // Liste des serveurs rootés [Server]
        TARGET_QUEUE: 2,     // Cibles prioritaires pour le hacking
        LOG_STREAM: 3,       // Flux de logs centralisés
        COMMANDS: 4          // Instructions de l'Orchestrateur vers les Managers
    },

    // Paramètres du système de Hacking
    HACKING: {
        MIN_SECURITY_THRESHOLD: 5,        // Marge au-dessus du min avant de Weaken
        MAX_MONEY_PERCENTAGE: 0.90,       // Garder le serveur à 90% de cash
        BATCH_SPACING: 30,                // Délai entre les attaques HWGW (ms)
        RESERVED_HOME_RAM: 32,            // RAM à laisser libre sur 'home' (GB)
        PREFER_FORMULAS: true             // Utiliser Formulas.exe si présent
    },

    // Paramètres des Managers
    MANAGERS: {
        PSERV_PREFIX: "nexus-node-",      // Préfixe des serveurs achetés
        MAX_PSERV_RAM: 1048576,           // Max RAM par pserv (2^20)
        AUTO_JOIN_FACTIONS: true,         // Accepter auto les invitations
        UPGRADE_HOME_RAM_PRIORITY: 1      // Priorité d'achat (1: High, 5: Low)
    },

    // Couleurs de log (ANSI Codes pour le terminal)
    COLORS: {
        INFO: "\u001b[32m",    // Vert
        WARN: "\u001b[33m",    // Jaune
        ERROR: "\u001b[31m",   // Rouge
        DEBUG: "\u001b[36m",   // Cyan
        RESET: "\u001b[0m"     // Reset
    }
};