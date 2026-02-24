import { CONFIG } from "/lib/constants.js";

/** * Nexus-Apex v44.0
 * Module: Gang Manager
 * Description: Gestionnaire autonome du Syndicat (BN2).
 * Logic: Recrute, équipe, promeut (ascension > 1.5x) et assigne dynamiquement les membres.
 * Usage: run /managers/gang-manager.js
 */

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tprint("🚀 Nexus Gang-Master Apex : Initialisation...");

    if (!ns.gang.inGang()) {
        ns.tprint("❌ Erreur : Tu n'es pas encore dans un gang. (BN2 requis)");
        return;
    }

    const isHackingGang = ns.gang.getGangInformation().isHacking;

    while (true) {
        const myGang = ns.gang.getGangInformation();
        const memberNames = ns.gang.getMemberNames();

        // 1. RECRUTEMENT AUTOMATIQUE
        if (ns.gang.canRecruitMember()) {
            const newName = `Nexus-${memberNames.length + 1}`;
            if (ns.gang.recruitMember(newName)) {
                ns.print(`[RECRUTEMENT] Bienvenue à ${newName}`);
            }
        }

        // 2. GESTION INDIVIDUELLE DES MEMBRES
        for (const name of memberNames) {
            const info = ns.gang.getMemberInformation(name);

            // A. ASCENSION (Le multiplicateur doit être > 1.5x pour valoir le coup)
            const ascResult = ns.gang.getAscensionResult(name);
            if (ascResult) {
                const threshold = 1.5;
                const statToCheck = isHackingGang ? ascResult.hack : ascResult.str;
                if (statToCheck >= threshold) {
                    ns.gang.ascendMember(name);
                    ns.print(`[ASCENSION] ${name} est monté en grade (Multi x${statToCheck.toFixed(2)})`);
                }
            }

            // B. ÉQUIPEMENT (On achète tout ce qu'on peut se permettre)
            const equipment = ns.gang.getEquipmentNames();
            for (const item of equipment) {
                const cost = ns.gang.getEquipmentCost(item);
                // Marge de sécurité de 10x le coût pour ne pas vider les caisses
                if (ns.getServerMoneyAvailable("home") > cost * 10) { 
                    if (ns.gang.purchaseEquipment(name, item)) {
                        ns.print(`[GEAR] Achat ${item} pour ${name}`);
                    }
                }
            }

            // C. ASSIGNATION DES TÂCHES
            // Si le Wanted Level est trop élevé (> 15% de pénalité), on baisse la pression
            if (myGang.wantedLevel > 1.1 && (myGang.wantedPenalty < 0.85)) {
                ns.gang.setMemberTask(name, isHackingGang ? "Ethical Hacking" : "Vigilante Justice");
            } 
            // Entraînement si stat trop basse
            else if ((isHackingGang ? info.hack : info.str) < 50) {
                ns.gang.setMemberTask(name, isHackingGang ? "Train Hacking" : "Train Combat");
            }
            // Mode "Profit & Respect"
            else {
                const idx = memberNames.indexOf(name);
                if (idx < 3) {
                    ns.gang.setMemberTask(name, isHackingGang ? "Cyberterrorism" : "Terrorism");
                } else {
                    ns.gang.setMemberTask(name, isHackingGang ? "Money Laundering" : "Human Trafficking");
                }
            }
        }

        // 3. GUERRE DE TERRITOIRE (> 85% de chances de gagner)
        const others = ns.gang.getOtherGangInformation();
        let canWinWar = true;
        for (const otherGang in others) {
            if (otherGang === myGang.faction) continue;
            if (ns.gang.getChanceToWinClash(otherGang) < 0.85) {
                canWinWar = false;
                break;
            }
        }
        ns.gang.setTerritoryWarfare(canWinWar);

        await ns.asleep(5000);
    }
}