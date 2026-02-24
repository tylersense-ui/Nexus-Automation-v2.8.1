import { CONFIG } from "/lib/constants.js";
import { Logger } from "/lib/logger.js";
import { Capabilities } from "/lib/capabilities.js";

/** * Nexus-Apex v44.0
 * Module: Program Manager
 * Description: Acquisition de l'arsenal de piratage.
 * Logic: Gère le Tor et l'achat de tous les .exe via l'API Singularity. S'auto-détruit si fini.
 * Usage: run /managers/program-manager.js
 */

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    const log = new Logger(ns, "CRACK");
    const caps = new Capabilities(ns);

    const PROGRAMS = [
        { name: "BruteSSH.exe", price: 500000 },
        { name: "FTPCrack.exe", price: 1500000 },
        { name: "relaySMTP.exe", price: 5000000 },
        { name: "HTTPWorm.exe", price: 30000000 },
        { name: "SQLInject.exe", price: 250000000 },
        { name: "Formulas.exe", price: 5000000000 }
    ];

    log.info("Manager d'Arsenal Apex v44.0 actif...");

    while (true) {
        caps.update();
        const cash = ns.getServerMoneyAvailable("home");
        const hasTor = ns.scan("home").includes("darkweb");

        // 1. ACHAT DU ROUTEUR TOR
        if (!hasTor && cash > 200000) {
            if (caps.singularity) {
                if (ns.singularity.purchaseTor()) {
                    log.info("Accès Darkweb (TOR) débloqué.");
                }
            } else {
                log.warn("TOR manquant. Achetez-le manuellement sur le terminal.");
            }
        }

        // 2. ACHAT DES PROGRAMMES (EXCLUSIVITÉ DU MANAGER)
        if (hasTor) {
            for (const prog of PROGRAMS) {
                if (!ns.fileExists(prog.name, "home") && cash >= prog.price) {
                    if (caps.singularity) {
                        if (ns.singularity.purchaseProgram(prog.name)) {
                            log.info(`Succès : ${prog.name} acquis.`);
                        }
                    } else {
                        log.warn(`Budget dispo pour ${prog.name}. Achetez-le sur le Darkweb.`);
                    }
                }
            }
        }

        // 3. AUTO-DESTRUCTION
        const allBought = PROGRAMS.every(p => ns.fileExists(p.name, "home"));
        if (allBought) {
            log.info("Arsenal complet. Fermeture du manager.");
            return;
        }

        await ns.asleep(30000); 
    }
}