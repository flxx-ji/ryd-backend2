// routes/utils.js

// ✅ Fonction pour recalculer le prix en fonction des jours
const calculerPrix = (tarifs, nbJours) => {
    if (nbJours >= 4 && nbJours <= 5) {
        return tarifs.quatreCinqJours;
    } else if (nbJours >= 7) {
        return tarifs.uneSemaine;
    } else if (nbJours >= 3) {
        return tarifs.troisJours;
    } else {
        return tarifs.unJour * nbJours;
    }
};

module.exports = { calculerPrix };
