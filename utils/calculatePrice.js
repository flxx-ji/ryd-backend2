// utils/calculatePrice.js

function calculatePrice(moto, nbJours) {
  const tarifs = moto.tarifs;
  
  if (!tarifs || !tarifs.unJour || !tarifs.uneSemaine) {
    throw new Error("Les tarifs ne sont pas correctement définis pour cette moto.");
  }

  if (nbJours === 1) {
    return tarifs.unJour;
  }

  if (nbJours >= 2 && nbJours <= 3) {
    return Math.round(tarifs.unJour * nbJours * 0.95); // -5%
  }

  if (nbJours >= 4 && nbJours <= 5) {
    return Math.round(tarifs.unJour * nbJours * 0.8); // -20%
  }

  if (nbJours >= 6) {
    // Le prix à la semaine s'applique pour 6 ou 7 jours
    return tarifs.uneSemaine;
  }

  return 0;
}

function calculerTarifsSpeciaux(unJour) {
  // on calcule et on FORCEMENT retourne des nombres (pas de string genre "640 - 800")
  const deuxTroisJours = Math.round(unJour * 2.5 * 0.95);
  const quatreCinqJours = Math.round(unJour * 4.5 * 0.8);
  const uneSemaine = Math.round(unJour * 7 * 0.8);

  return {
    deuxTroisJours: Number(deuxTroisJours),
    quatreCinqJours: Number(quatreCinqJours),
    uneSemaine: Number(uneSemaine)
  };
}


module.exports = { calculatePrice, calculerTarifsSpeciaux };
