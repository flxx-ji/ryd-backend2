// routes/pageRoutes.js

const express = require('express');
const router = express.Router();

// Route pour la page d'accueil (Home)
router.get('/home', (req, res) => {
    res.json({
        title: "Bienvenue sur Ride Your Dreams",
        description: "Louez les meilleures motos et scooters pour vos aventures!",
        imageUrl: "https://ryd-backend2.onrender.com/uploads/home3.webp"
    });
});

// Route pour la page du catalogue
router.get('/catalogue', (req, res) => {
    res.json({
        title: "Notre catalogue de motos",
        description: "Explorez notre large sélection de motos et scooters à louer.",
        imageUrl: "https://ryd-backend2.onrender.com/uploads/catalogue.webp"
    });
});

// Ajoute d'autres pages ici si nécessaire (Services, A propos, etc.)
router.get('/services', (req, res) => {
    res.json({
        title: "Nos services",
        description: "Découvrez nos services de location de motos, livraison et support.",
        imageUrl: "https://ryd-backend2.onrender.com/uploads/services.webp"
    });
});

module.exports = router;
