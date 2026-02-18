/** @param {NS} ns */
import { PortHandler } from "/core/port-handler.js";

export async function main(ns) {
    const ph = new PortHandler(ns);
    const TARGET_PORT = 1;
    
    ns.disableLog("ALL");
    
    while (true) {
        const job = ph.read(TARGET_PORT);
        
        // Sécurité : On vérifie que le job existe et contient les données nécessaires
        if (job && job.host && job.type && job.target) {
            const script = `/hack/workers/${job.type}.js`;
            
            try {
                // Copie des fichiers si nécessaire
                if (job.host !== "home") {
                    await ns.scp(script, job.host, "home");
                }

                // Exécution
                let pid = ns.exec(script, job.host, job.threads, job.target);
                
                if (pid === 0 && job.threads > 1) {
                    ns.exec(script, job.host, job.threads - 1, job.target);
                }
            } catch (e) {
                // On évite le crash fatal, on log l'erreur discrètement
                // ns.print("Erreur d'exécution sur " + job.host);
            }
        }
        
        await ns.asleep(20);
    }
}