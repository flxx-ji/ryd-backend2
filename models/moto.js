const mongoose = require('mongoose');

// 🛠️ Schéma de la moto
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
    deuxTroisJours: { type: Number },
    quatreCinqJours: { type: Number },
    uneSemaine: { type: Number }
  },
  disponible: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    required: false,
    default: '/uploads/default_image.webp'
  },
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


// 🎯 Hook : Avant sauvegarde, calcule automatiquement les tarifs étendus
motoSchema.pre('save', function (next) {
  if (this.tarifs && this.tarifs.unJour) {
    const unJour = this.tarifs.unJour;

    // 💡 Logique de calcul
    this.tarifs.deuxTroisJours = Math.round((unJour * 2 + (unJour * 0.8)) * 100) / 100; // -20% sur le 3e jour
    this.tarifs.quatreCinqJours = Math.round((unJour * 4 + (unJour * 0.8)) * 100) / 100; // -20% sur le 5e jour
    this.tarifs.uneSemaine = Math.round(unJour * 6); // 7e jour offert
  }
  next();
});

// ✅ Exporte le modèle (vérifie s’il existe déjà)
module.exports = mongoose.models.Moto || mongoose.model('Moto', motoSchema);
