// routes/admin/adminMotoRoutes.js

const express = require('express');
const router = express.Router();
const Moto = require('../models/moto');
const authMiddleware = require('../middleware/authMiddleware');


// Fonction pour calculer les tarifs spéciaux à l'enregistrement
function calculerTarifsSpeciaux(unJour) {
  const deuxTroisJours = `${unJour * 2} - ${unJour * 3}`;
  const quatreCinqJours = `${(unJour * 4 * 0.8).toFixed(2)} - ${(unJour * 5 * 0.8).toFixed(2)}`;
  const uneSemaine = unJour * 6; // 7e jour offert
  return { deuxTroisJours, quatreCinqJours, uneSemaine };
}

// ➕ Ajouter une nouvelle moto (admin uniquement)
router.post('/',authMiddleware, async (req, res) => {
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
router.put('/:id',authMiddleware, async (req, res) => {
  try {
    const { tarifs } = req.body;

    // 🛑 Sécurité : Vérifie que tarifs et unJour sont bien définis
    if (!tarifs || typeof tarifs.unJour !== 'number') {
      return res.status(400).json({ message: "❌ Le tarif 'unJour' est manquant ou invalide." });
    }

    // 🔄 Calcul des tarifs dérivés
    const tarifsSpeciaux = calculerTarifsSpeciaux(tarifs.unJour);

    const motoModifiee = await Moto.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        tarifs: {
          ...tarifs,
          deuxTroisJours: tarifsSpeciaux.deuxTroisJours,
          quatreCinqJours: tarifsSpeciaux.quatreCinqJours,
          uneSemaine: tarifsSpeciaux.uneSemaine,
        }
      },
      { new: true, runValidators: true }
    );

    if (!motoModifiee) {
      return res.status(404).json({ message: '❌ Moto non trouvée.' });
    }

    res.status(200).json(motoModifiee);
  } catch (err) {
    console.error("❌ Erreur modification moto :", err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Modification partiel (tarifs, etc.)
router.patch('/:id', async (req, res) => {
  try {
    const moto = await Moto.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!moto) return res.status(404).json({ message: "Moto introuvable." });
    res.json(moto);
  } catch (err) {
    console.error("Erreur PATCH moto :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 🗑️ Supprimer une moto
router.delete('/:id',authMiddleware, async (req, res) => {
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
router.get('/',authMiddleware, async (req, res) => {
  try {
    const motos = await Moto.find();
    res.json(motos);
  } catch (err) {
    console.error("Erreur récupération motos :", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ TEMP PATCH - Corriger motos incomplètes
router.patch('/reparer-tarifs', authMiddleware, async (req, res) => {
  try {
    const motos = await Moto.find({ 'tarifs.unJour': { $exists: true } });

    let reparations = 0;

    for (let moto of motos) {
      const unJour = moto.tarifs.unJour;
      const tarifsSpeciaux = {
        deuxTroisJours: `${unJour * 2} - ${unJour * 3}`,
        quatreCinqJours: `${(unJour * 4 * 0.8).toFixed(2)} - ${(unJour * 5 * 0.8).toFixed(2)}`,
        uneSemaine: unJour * 6
      };

      // On met à jour les champs manquants
      moto.tarifs = {
        ...moto.tarifs,
        ...tarifsSpeciaux
      };

      await moto.save();
      reparations++;
    }

    res.json({ message: `✅ ${reparations} motos corrigées.` });
  } catch (err) {
    console.error("Erreur réparation motos :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 📄 Obtenir une moto par ID (admin)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const moto = await Moto.findById(req.params.id);
    if (!moto) {
      return res.status(404).json({ message: "Moto introuvable." });
    }
    res.status(200).json(moto);
  } catch (err) {
    console.error("Erreur récupération moto :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});



module.exports = router;
