// Importation des modules nécessaires
const multer = require('multer');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Moto = require('../models/moto.js');
const fs = require('fs');

// 📌 Vérifier si le dossier "uploads" existe, sinon le créer
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Crée le dossier s'il n'existe pas
    console.log("📂 Dossier 'uploads' créé ✅");
}

// Définir le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Dossier où seront stockées les images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom unique pour éviter les doublons
  }
});

// Filtrer les fichiers (Accepter uniquement les images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|avif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error('Seuls les fichiers JPEG, JPG, PNG, webp et avif sont autorisés'));
  }
};

// Initialiser Multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB par fichier
});

// 1️⃣ Lister toutes les motos (GET)
router.get('/', async (req, res) => {
    try {
      const motos = await Moto.find(); // Récupérer toutes les motos
      res.status(200).json(motos);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des motos", error });
    }
});
  
// 2️⃣ Obtenir une moto par son ID (GET)
router.get('/:id', async (req, res) => {
    try {
        // Vérifie si l'ID est bien un ObjectId valide
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "ID invalide" });
        }

        const moto = await Moto.findById(req.params.id); // Recherche la moto
        if (!moto) return res.status(404).json({ message: "Moto non trouvée" });

        res.status(200).json(moto);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de la moto", error });
    }
});

/**
 * Route POST /motos pour ajouter une nouvelle moto
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log("📩 Requête reçue :", req.body);
    console.log("📸 Fichier reçu :", req.file ? req.file.filename : "Aucune image reçue");

    const { nom, marque, modele, annee, couleur, tarifs, disponible, caracteristiques, equipements } = req.body;

    // Vérification des champs obligatoires
    if (!nom || !annee || !tarifs || !tarifs.unJour) {
        return res.status(400).json({ message: "❌ Le nom, l'année et le tarif journalier sont requis." });
    }

    // Convertir l'année en nombre
    const anneeNum = Number(annee);
    if (isNaN(anneeNum) || isNaN(tarifs.unJour) || isNaN(tarifs.troisJours) || isNaN(tarifs.uneSemaine) || isNaN(tarifs.quatreCinqJours)) {
        return res.status(400).json({ message: "❌ L'année et le prix doivent être des nombres valides." });
    }

    // Vérifier si une image a été envoyée
   const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Créer la nouvelle moto
    const nouvelleMoto = new Moto({ 
        nom, 
        marque, 
        modele, 
        annee: anneeNum, 
        couleur, 
        tarifs,
        disponible: disponible === "true", // Converti en booléen
        caracteristiques: {
          moteur: caracteristiques.moteur || "Non spécifié",
          cylindree: caracteristiques.cylindree || "Non spécifié",
          transmission: caracteristiques.transmission || "Non spécifié",
          poids: caracteristiques.poids || "Non spécifié",
          autonomie: caracteristiques.autonomie || "Non spécifié",
          reservoir: caracteristiques.reservoir || "Non spécifié"
      },
        image: imageUrl
    });

    const motoEnregistree = await nouvelleMoto.save();
    res.status(201).json(motoEnregistree);

  } catch (error) {
    console.error("❌ Erreur lors de l'ajout de la moto :", error);
    res.status(500).json({ message: "Erreur lors de l'ajout de la moto", error });
  }
});

// Exportation du routeur pour l'utiliser dans server.js
module.exports = router;
