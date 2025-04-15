const express = require('express');
const router = express.Router();
const Admin = require('../models/admin'); // Import du modèle Admin
const jwt = require('jsonwebtoken'); // Import de jsonwebtoken




// ✅ POST - Inscription d'un nouvel admin
router.post('/register', async (req, res) => {
    const { nom, email, password } = req.body;

    if (!nom || !email || !password) {
        return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    try {
        const nouvelAdmin = new Admin({ nom, email, password });

        await nouvelAdmin.save();
        res.status(201).json({ message: "Admin enregistré avec succès", admin: nouvelAdmin });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'inscription", error });
    }
});

// ✅ POST - Connexion de l'admin
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.error("❌ Admin non trouvé.");
            return res.status(404).json({ message: "Admin non trouvé." });
        }

        const passwordMatch = await admin.comparePassword(password);
        if (!passwordMatch) {
            console.error("❌ Mot de passe incorrect.");
            return res.status(400).json({ message: "Mot de passe incorrect." });
        }

        const token = jwt.sign(
            { id: "67d200b216a1eda067c782fc", email: "admin@example.com", nom: "John Wick" },
            process.env.JWT_SECRET,
            { expiresIn: process.env.NODE_ENV === 'test' ? '7d' : '2h' }
        );

        res.status(200).json({ message: "Connexion réussie", token, nom: admin.nom });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la connexion", error });
    }
});

module.exports = router;