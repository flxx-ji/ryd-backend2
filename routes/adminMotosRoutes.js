const express = require('express');
const router = express.Router();
const Moto = require('../models/moto');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
const multer = require('multer');

// 🛡️ Toutes les routes sont protégées par un token JWT
router.use(authMiddleware);

// 📦 Multer – Gère l’upload d’images
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
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
            tarifs: JSON.parse(tarifs), // ⚠️ Car reçu sous forme de string depuis un formulaire
            disponible: disponible === 'true' || disponible === true,
            caracteristiques: JSON.parse(caracteristiques || '{}'),
            equipements: JSON.parse(equipements || '[]'),
            image: req.file ? `/uploads/${req.file.filename}` : '/uploads/default_image.webp'
        });

        const motoEnregistree = await nouvelleMoto.save();
        res.status(201).json(motoEnregistree);
    } catch (error) {
        console.error("❌ Erreur ajout moto :", error);
        res.status(500).json({ message: "Erreur ajout moto", error });
    }
});

// ✅ 2. Récupérer toutes les motos (GET)
router.get('/', async (req, res) => {
    try {
        const motos = await Moto.find();
        res.status(200).json(motos);
    } catch (error) {
        res.status(500).json({ message: "Erreur récupération motos", error });
    }
});

// ✅ 3. Récupérer une moto par ID (GET)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID invalide" });
        }

        const moto = await Moto.findById(id);
        if (!moto) return res.status(404).json({ message: "Moto non trouvée" });

        res.status(200).json(moto);
    } catch (error) {
        res.status(500).json({ message: "Erreur récupération moto", error });
    }
});

// ✅ 4. Modifier une moto (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID invalide" });
        }

        const updatedMoto = await Moto.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true, context: 'query' }
        );

        if (!updatedMoto) return res.status(404).json({ message: "Moto non trouvée" });

        res.status(200).json(updatedMoto);
    } catch (error) {
        res.status(500).json({ message: "Erreur mise à jour moto", error });
    }
});

// ✅ 5. Supprimer une moto (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID invalide" });
        }

        const deleted = await Moto.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Moto non trouvée" });

        res.status(200).json({ message: "Moto supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur suppression moto", error });
    }
});

module.exports = router;
