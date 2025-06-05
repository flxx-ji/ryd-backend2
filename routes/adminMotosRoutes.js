// routes/admin/adminMotoRoutes.js

const express = require('express');
const router = express.Router();
const Moto = require('../../models/moto');

// Fonction pour calculer les tarifs spéciaux à l'enregistrement
function calculerTarifsSpeciaux(unJour) {
  const deuxTroisJours = `${unJour * 2} - ${unJour * 3}`;
  const quatreCinqJours = `${(unJour * 4 * 0.8).toFixed(2)} - ${(unJour * 5 * 0.8).toFixed(2)}`;
  const uneSemaine = unJour * 6; // 7e jour offert
  return { deuxTroisJours, quatreCinqJours, uneSemaine };
}

// ➕ Ajouter une nouvelle moto (admin uniquement)
router.post('/', async (req, res) => {
  try {
    const { unJour } = req.body.tarifs;
    const tarifsSpeciaux = calculerTarifsSpeciaux(unJour);

    const nouvelleMoto = new Moto({
      ...req.body,
      tarifs: {
        ...req.body.tarifs,
        deuxTroisJours: tarifsSpeciaux.deuxTroisJours,
        quatreCinqJours: tarifsSpeciaux.quatreCinqJours,
        uneSemaine: tarifsSpeciaux.uneSemaine,
      }
    });

    const motoCreee = await nouvelleMoto.save();
    res.status(201).json(motoCreee);
  } catch (err) {
    console.error("Erreur création moto :", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 📝 Modifier une moto
router.put('/:id', async (req, res) => {
  try {
    const { unJour } = req.body.tarifs;
    const tarifsSpeciaux = calculerTarifsSpeciaux(unJour);

    const motoModifiee = await Moto.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        tarifs: {
          ...req.body.tarifs,
          deuxTroisJours: tarifsSpeciaux.deuxTroisJours,
          quatreCinqJours: tarifsSpeciaux.quatreCinqJours,
          uneSemaine: tarifsSpeciaux.uneSemaine,
        }
      },
      { new: true }
    );

    if (!motoModifiee) return res.status(404).json({ message: 'Moto non trouvée' });

    res.json(motoModifiee);
  } catch (err) {
    console.error("Erreur modification moto :", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 🗑️ Supprimer une moto
router.delete('/:id', async (req, res) => {
  try {
    const moto = await Moto.findByIdAndDelete(req.params.id);
    if (!moto) return res.status(404).json({ message: 'Moto non trouvée' });
    res.json({ message: 'Moto supprimée' });
  } catch (err) {
    console.error("Erreur suppression moto :", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 📄 Lister toutes les motos (admin)
router.get('/', async (req, res) => {
  try {
    const motos = await Moto.find();
    res.json(motos);
  } catch (err) {
    console.error("Erreur récupération motos :", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
