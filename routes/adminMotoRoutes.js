const express = require('express');
const router = express.Router();
const Moto = require('../models/moto'); 
const authMiddleware = require('../middleware/authMiddleware'); // 🔒 Ajout du middleware de sécurité
const mongoose = require('mongoose');
const multer = require('multer');



// Toutes les routes ci-dessous sont protégées
router.use(authMiddleware);

// 📂 Configuration de Multer pour gérer les images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Chemin du dossier de stockage des images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Nom unique basé sur la date
    }
});
const upload = multer({ storage });

// ✅ 1. Ajouter une moto (POST)
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { nom, marque, modele, annee, couleur, tarifs, disponible, caracteristiques, equipements } = req.body;

        const nouvelleMoto = new Moto({
            nom,
            marque,
            modele,
            annee,
            couleur,
            tarifs,
            disponible: disponible === 'true' || disponible === true,
            caracteristiques,
            equipements,
            image: req.file ? `/uploads/${req.file.filename}` : null // Gestion de l'image
        });

        const motoEnregistree = await nouvelleMoto.save();
        res.status(201).json(motoEnregistree);
    } catch (error) {
        console.error("❌ Erreur lors de l'ajout de la moto :", error);
        res.status(500).json({ message: "Erreur lors de l'ajout de la moto", error });
    }
});

// ✅ 2. Récupérer toutes les motos (GET)
router.get('/', async (req, res) => {
    try {
        const motos = await Moto.find();
        res.status(200).json(motos);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des motos", error });
    }
});

// ✅ 3. Récupérer une moto par ID (GET)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID invalide" });
        }

        const moto = await Moto.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!moto) return res.status(404).json({ message: "Moto non trouvée" });

        res.status(200).json(moto);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de la moto", error });
    }
});

// ✅ 4. Modifier une moto existante (PUT)
// ✅ 4. Modifier une moto existante (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID invalide" });
        }

        const moto = await Moto.findByIdAndUpdate(id, 
            { $set: req.body },  // 🔥 Utilisation de `$set` pour éviter l'écrasement des champs manquants
            { new: true, runValidators: true, context: 'query' } 
        );

        if (!moto) return res.status(404).json({ message: "Moto non trouvée" });

        res.status(200).json(moto);
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour de la moto :", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de la moto", error });
    }
});


// ✅ 5. Supprimer une moto (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID invalide" });
        }

        const moto = await Moto.findByIdAndDelete(id);
        if (!moto) return res.status(404).json({ message: "Moto non trouvée" });

        res.status(200).json({ message: "Moto supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de la moto", error });
    }
});

module.exports = router;
