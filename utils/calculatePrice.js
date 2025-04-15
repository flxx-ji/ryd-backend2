// utils/calculatePrice.js

/**
 * Calcule le prix en fonction du nombre de jours et des règles spéciales
 * @param {number} jours - Le nombre de jours de location
 * @param {number} tarifJournalier - Tarif standard par jour
 * @param {Object} tarifsSpeciaux - Contient les tarifs fixes et la réduction
 * @returns {number} - Prix total calculé
 */
function calculatePrice(jours, tarifJournalier, tarifsSpeciaux) {
    if (jours <= 0) return 0; // Protection contre les cas négatifs ou 0 jours

    // Gestion des tarifs spéciaux
    if (jours === 3) {
        return tarifsSpeciaux.troisJours; // Prix fixe pour 3 jours
    }

    if (jours >= 4 && jours <= 5) {
        return jours * tarifJournalier * 0.8; // Réduction de -20%
    }

    if (jours === 7) {
        return tarifsSpeciaux.uneSemaine; // Prix fixe pour 1 semaine
    }

    // Si aucune règle spéciale ne s'applique, tarif journalier classique
    return jours * tarifJournalier;
}

module.exports = { calculatePrice };
