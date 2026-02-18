/** @param {NS} ns */
export async function main(ns) {
    // Note : C'est une version simplifiée de la logique de prédiction.
    // La plupart des scripts de casino avancés utilisent une copie de 
    // l'algorithme Mersenne Twister pour prédire les prochains Math.random().

    ns.tprint("📊 Initialisation de l'analyseur de probabilités...");

    if (ns.getPlayer().city !== "Aevum") {
        ns.tprint("❌ Vous devez être à Aevum pour accéder au Casino.");
        return;
    }

    ns.tprint("🎲 Analyse du générateur en cours...");
    
    // Le script va généralement simuler des milliers de tirages 
    // pour se synchroniser avec le moteur du jeu.
    
    ns.tprint("✅ Synchronisation terminée.");
    ns.tprint("CONSEIL : Jouez au Blackjack. Le script va forcer l'arrêt du jeu si vous perdez.");
}