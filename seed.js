const mongoose = require('mongoose');
const Moto = require('./models/moto'); // Import du modèle Moto
const connectDB = require('./config/db'); // Connexion à la BDD
const dotenv = require('dotenv'); // Ajout de dotenv pour les variables d'environnement

// Chargement des variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

// 🚲 Liste des motos avec leurs vrais prix et tarifs
const motos = [
    { 
        nom: "CRUISE", marque: "Harley-Davidson", modele: "Street Glide", annee: 2025, couleur: "Noir",
        tarifs: { unJour: 180, troisJours: 370, uneSemaine: 650, quatreCinqJours: 520 },
        image: "/uploads/cruise.webp", // URL de l'image en production
        disponible: true,
        caracteristiques: {
            moteur: "Milwaukee-Eight 117",
            cylindree: "1923",
            transmission: "Chaîne (34/46)",
            poids: "380",
            autonomie: "378",
            reservoir: "22.7"
        },
        equipements: ["Casque", "Gants", "GPS", "GoPro", "Combi Pluie", "Carte sd"]
    },
    { 
        nom: "BRAD", marque: "Harley-Davidson", modele: "Road Glide", annee: 2025, couleur: "Bleu metallique",
        tarifs: { unJour: 175, troisJours: 350, uneSemaine: 620, quatreCinqJours: 500 },
        image: "/uploads/brad.webp", // URL de l'image en production
        disponible: true,
        caracteristiques: {
            moteur: "Milwaukee-Eight 114",
            cylindree: "1868",
            transmission: "Entraînement par courroie",
            poids: "387",
            autonomie: "350",
            reservoir: "22.7"
        },
        equipements: ["Casque", "Gants", "GPS", "GoPro", "Combi Pluie", "Carte sd"]
    },
    { 
        nom: "NEO", marque: "Ducati", modele: "Multistrada", annee: 2025, couleur: "Rouge",
        tarifs: { unJour: 175, troisJours: 350, uneSemaine: 620, quatreCinqJours: 500 },
        image: "/uploads/neo.webp", // URL de l'image en production
        disponible: true,
        caracteristiques: {
            moteur: "Moteur Ducati V2",
            cylindree: "890",
            transmission: "6 vitesses",
            poids: "199",
            autonomie: "339",
            reservoir: "19"
        },
        equipements: ["Casque", "Gants", "GPS", "GoPro", "Combi Pluie", "Carte sd"]
    },
    { 
        nom: "JASON", marque: "Harley-Davidson", modele: "Panamérica", annee: 2025, couleur: "Bleu",
        tarifs: { unJour: 160, troisJours: 300, uneSemaine: 560, quatreCinqJours: 450 },
        image: "/uploads/jason.webp", // URL de l'image en production
        disponible: true,
        caracteristiques: {
            moteur: "Revolution Max 1250",
            cylindree: "1252",
            transmission: "6 vitesses",
            poids: "299",
            autonomie: "339",
            reservoir: "21"
        },
        equipements: ["Casque", "Gants", "GPS", "GoPro", "Combi Pluie", "Carte sd"]
    },
    { 
        nom: "McQueen", marque: "Triumph", modele: "Bonnevile boober TFC", annee: 2025, couleur: "Noir", 
        tarifs: { unJour: 140, troisJours: 250, uneSemaine: 470, quatreCinqJours: 370 },
        image: "/uploads/mcqueen.webp", // URL de l'image en production
        disponible: true,
        caracteristiques: {
            moteur: "Twin parallele",
            cylindree: "1200cc",
            transmission: "6 vitesses",
            poids: "237",
            autonomie: "288",
            reservoir: "9"
        },
        equipements: ["Casque", "Gants", "GPS", "GoPro", "Combi Pluie", "Carte sd"]
    },
    { 
        nom: "King", marque: "Triumph", modele: "Bonnevile T120", annee: 2025, couleur: "Noir", 
        tarifs: { unJour: 140, troisJours: 250, uneSemaine: 470, quatreCinqJours: 370 },
        image: "/uploads/king.avif", // URL de l'image en production
        disponible: true,
        caracteristiques: {
            moteur: "Twin parallele",
            cylindree: "1200cc",
            transmission: "6 vitesses",
            poids: "237",
            autonomie: "288",
            reservoir: "14.5"
        },
        equipements: ["Casque", "Gants", "GPS", "GoPro", "Combi Pluie", "Carte sd"]
    }
     
];

// 📌 Fonction pour insérer les motos
const insertMotos = async () => {
    try {
        // Suppression des anciennes données
        await Moto.deleteMany();
        console.log("🔄 Anciennes motos supprimées.");

        // Ajout des nouvelles motos
        await Moto.insertMany(motos);
        console.log("✅ Nouvelles motos enregistrées !");
        
        // Fermer la connexion à MongoDB après l'insertion des données
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Erreur lors de l'insertion des motos :", error);
        mongoose.connection.close();
    }
};

// Exécuter le script
insertMotos();
