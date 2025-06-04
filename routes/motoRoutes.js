const multer = require('multer');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Moto = require('../models/moto.js');
const fs = require('fs');

// 📌 Vérifier si le dossier "uploads" existe
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📂 Dossier 'uploads' créé ✅");
}

// 🔧 Config multer pour les images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|avif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) cb(null, true);
  else cb(new Error('Seuls les fichiers JPEG, JPG, PNG, webp et avif sont autorisés'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

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

    if (!nom || !annee || !tarifs || !tarifs.unJour) {
      return res.status(400).json({ message: "❌ Le nom, l'année et le tarif journalier sont requis." });
    }

    const anneeNum = Number(annee);
    const unJour = Number(tarifs.unJour);
    const uneSemaine = Number(tarifs.uneSemaine);

    if (isNaN(anneeNum) || isNaN(unJour) || isNaN(uneSemaine)) {
      return res.status(400).json({ message: "❌ L'année et le prix doivent être des nombres valides." });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const nouvelleMoto = new Moto({
      nom,
      marque,
      modele,
      annee: anneeNum,
      couleur,
      tarifs: {
        unJour,
        uneSemaine,
        deuxTroisJours: tarifs.deuxTroisJours,
        quatreCinqJours: tarifs.quatreCinqJours
      },
      disponible: disponible === "true" || disponible === true,
      caracteristiques: {
        moteur: caracteristiques?.moteur || "Non spécifié",
        cylindree: caracteristiques?.cylindree || "Non spécifié",
        transmission: caracteristiques?.transmission || "Non spécifié",
        poids: caracteristiques?.poids || "Non spécifié",
        autonomie: caracteristiques?.autonomie || "Non spécifié",
        reservoir: caracteristiques?.reservoir || "Non spécifié"
      },
      equipements: equipements || ["Casque", "Gants", "GPS", "Gopro", "Carte Sd", "Combi de pluie"],
      image: imageUrl
    });

    const motoEnregistree = await nouvelleMoto.save();
    res.status(201).json(motoEnregistree);
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout de la moto :", error);
    res.status(500).json({ message: "Erreur lors de l'ajout de la moto", error });
  }
});

// 4️⃣ PATCH /api/motos/:id → Modifier
router.patch('/:id', async (req, res) => {
  const id = String(req.params.id).trim();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const updatedMoto = await Moto.findByIdAndUpdate(id, req.body, {
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
