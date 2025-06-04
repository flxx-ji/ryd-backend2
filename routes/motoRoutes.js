const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Moto = require('../models/moto.js');
const multer = require('multer');
const cloudinaryStorage = require('../config/storage'); // 🔧 Cloudinary config
const upload = multer({ storage: cloudinaryStorage }); // ✅ Upload via Cloudinary

// 1️⃣ GET /api/motos → Liste
router.get('/', async (req, res) => {
  try {
    const motos = await Moto.find();
    res.status(200).json(motos);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des motos", error });
  }
});

// 2️⃣ GET /api/motos/:id → Détail
router.get('/:id', async (req, res) => {
  const id = String(req.params.id).trim();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const moto = await Moto.findById(id);
    if (!moto) return res.status(404).json({ message: "Moto non trouvée" });
    res.status(200).json(moto);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de la moto", error });
  }
});

// 3️⃣ POST /api/motos → Ajouter une moto
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { nom, marque, modele, annee, couleur, tarifs, disponible, caracteristiques, equipements } = req.body;

    if (!nom || !annee || !tarifs || !JSON.parse(tarifs).unJour) {
      return res.status(400).json({ message: "❌ Le nom, l'année et le tarif journalier sont requis." });
    }

    const anneeNum = Number(annee);
    const parsedTarifs = JSON.parse(tarifs);

    const imageUrl = req.file ? req.file.path : null;

    const nouvelleMoto = new Moto({
      nom,
      marque,
      modele,
      annee: anneeNum,
      couleur,
      tarifs: {
        unJour: parsedTarifs.unJour,
        deuxTroisJours: parsedTarifs.deuxTroisJours,
        quatreCinqJours: parsedTarifs.quatreCinqJours,
        uneSemaine: parsedTarifs.uneSemaine
      },
      disponible: disponible === "true" || disponible === true,
      caracteristiques: caracteristiques || {},
      equipements: equipements || [],
      image: imageUrl
    });

    const motoEnregistree = await nouvelleMoto.save();
    res.status(201).json(motoEnregistree);
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout de la moto :", error);
    res.status(500).json({ message: "Erreur lors de l'ajout de la moto", error });
  }
});

// 4️⃣ PATCH /api/motos/:id → Modifier (image + données)
router.patch('/:id', upload.single('image'), async (req, res) => {
  const id = String(req.params.id).trim();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const data = { ...req.body };

    if (req.file) {
      data.image = req.file.path; // 🔥 Cloudinary image URL
    }

    if (data.tarifs && typeof data.tarifs === 'string') {
      data.tarifs = JSON.parse(data.tarifs);
    }

    const updatedMoto = await Moto.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });

    if (!updatedMoto) {
      return res.status(404).json({ message: "Moto non trouvée" });
    }

    res.status(200).json(updatedMoto);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// 5️⃣ DELETE /api/motos/:id → Supprimer
router.delete('/:id', async (req, res) => {
  const id = String(req.params.id).trim();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const deletedMoto = await Moto.findByIdAndDelete(id);

    if (!deletedMoto) {
      return res.status(404).json({ message: "Moto non trouvée" });
    }

    res.status(200).json({ message: "Moto supprimée avec succès", moto: deletedMoto });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

module.exports = router;
