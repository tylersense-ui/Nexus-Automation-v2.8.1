import { PortHandler } from "/core/port-handler.js";
import { CONFIG } from "/lib/constants.js";
import { Logger } from "/lib/logger.js";

/** * Nexus-Apex v44.0
 * Module: Unified Controller
 * Description: Dispatcher central des threads d'exécution.
 * Logic: Lit les commandes du Port 4, déploie les workers si nécessaire, et force l'exécution (anti-drop).
 * Usage: Lancé automatiquement par l'Orchestrateur. (run /hack/controller.js)
 */
export async function main(ns) {
    ns.disableLog("ALL");
    const log = new Logger(ns, "CONTROLLER");
    const ph = new PortHandler(ns);
    const COMMAND_PORT = CONFIG.PORTS.COMMANDS;
    
    const deployedNodes = new Set();
    const WORKER_FILES = [
        "/hack/workers/hack.js", 
        "/hack/workers/grow.js", 
        "/hack/workers/weaken.js", 
        "/hack/workers/share.js"
    ];

    log.info(`Écoute active sur le Port ${COMMAND_PORT}...`);

    while (true) {
        let job = ph.readJSON(COMMAND_PORT);
        
        if (job) {
            const scriptPath = `/hack/workers/${job.type}.js`;

            // Déploiement paresseux (lazy deployment) des fichiers sur le nœud cible
            if (job.host !== "home" && !deployedNodes.has(job.host)) {
                await ns.scp(WORKER_FILES, job.host, "home");
                deployedNodes.add(job.host);
            }

            // Exécution avec Salt (Math.random) pour autoriser le multi-threading simultané sur la même cible
            let pid = ns.exec(scriptPath, job.host, job.threads, job.target || "network", job.delay || 0, Math.random());

            // Correction Ghost in the Shell : Boucle anti-perte de job
            while (pid === 0 && job.threads > 0) {
                await ns.asleep(5); // Pause de 5ms pour laisser la RAM se libérer
                pid = ns.exec(scriptPath, job.host, job.threads, job.target || "network", job.delay || 0, Math.random());
            }
        }
        await ns.asleep(1); // Latence de boucle minimale pour vider le port rapidement
    }
}