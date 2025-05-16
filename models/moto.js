const mongoose = require('mongoose');

// Définition du schéma de la moto
const motoSchema = new mongoose.Schema({
    nom: {
        type: String, 
        required: [true, "Le nom de la moto est requis"]
    },
    marque: {
        type: String,
        required: true,
        trim: true
    },
    modele: {
        type: String,
        required: true,
        trim: true
    },
    annee: {
        type: Number,
        required: true,
        min: 1900,
        max: new Date().getFullYear()
    },
    couleur: {
        type: String,
        required: true
    },
  tarifs: {
  unJour: { type: Number, required: true },
  uneSemaine: { type: Number, required: true },
  deuxTroisJours: { type: String },
  quatreCinqJours: { type: String }
}
,
    disponible: {
        type: Boolean,
        default: true
    },
    image: { type: String, required: false, default: '/uploads/default_image.webp' },

    caracteristiques: {
        moteur: { type: String, default: "Non spécifié" },
        cylindree: { type: String, default: "Non spécifié" },
        transmission: { type: String, default: "Non spécifié" },
        poids: { type: String, default: "Non spécifié" },
        autonomie: { type: String, default: "Non spécifié" },
        reservoir: { type: String, default: "Non spécifié" }
    },
    equipements: {
        type: [String],
        default: ["Casque", "Gants", "GPS", "Gopro", "Carte Sd", "Combi de pluie"]
    }
}, { timestamps: true });

// ✅ Solution : Vérifie si le modèle existe déjà avant de le définir
module.exports = mongoose.models.Moto || mongoose.model('Moto', motoSchema);
