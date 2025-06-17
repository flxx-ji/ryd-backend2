const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const Moto = require('../models/moto');
const Reservation = require('../models/reservation');
const { calculatePrice } = require('../utils/calculatePrice');

// 📥 Créer une réservation
router.post('/', async (req, res) => {
  try {
    const {
      clientId,
      motoId,
      dateDebut,
      dateFin,
      heureDebut,
      heureFin,
      email,
      telephone
    } = req.body;

    // 🔒 Validation champs requis
    if (!clientId || !motoId || !dateDebut || !dateFin || !heureDebut || !heureFin || !email || !telephone) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // ✅ Récupérer la moto selon ID ou nom partiel
    const motoTrouvee = mongoose.isValidObjectId(motoId)
      ? await Moto.findById(motoId)
      : await Moto.findOne({ nom: { $regex: new RegExp(motoId, 'i') } });

    if (!motoTrouvee)
      return res.status(404).json({ message: "Moto introuvable" });

    // 🧮 Calcul du nombre de jours réels
    const debut = new Date(`${dateDebut}T${heureDebut}`);
    const fin = new Date(`${dateFin}T${heureFin}`);
    const nbJours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));

    if (nbJours <= 0 || isNaN(nbJours)) {
      return res.status(400).json({
        message: "Erreur dans le calcul du prix. Veuillez vérifier vos dates."
      });
    }

    // ❌ Vérification de conflits de réservation (chevauchement)
    const conflitReservation = await Reservation.findOne({
      motoId: motoTrouvee._id,
      statut: { $ne: 'annulée' },
      $or: [
        { dateDebut: { $lt: fin }, dateFin: { $gt: debut } },
        { dateDebut: { $eq: debut }, dateFin: { $eq: fin } }
      ]
    });

    if (conflitReservation) {
      return res.status(400).json({
        message: "❌ La moto est déjà réservée à ces horaires.",
        conflit: conflitReservation
      });
    }

    // 💸 Calcul du prix selon la logique métier
    const prixTotalCalcule = calculatePrice(motoTrouvee.tarifs, nbJours);

    if (isNaN(prixTotalCalcule) || prixTotalCalcule <= 0) {
      return res.status(400).json({
        message: "Erreur dans le calcul du prix. Veuillez vérifier vos dates."
      });
    }

    // ✅ Création de la réservation
    const nouvelleReservation = new Reservation({
      clientId,
      motoId: motoTrouvee._id,
      nomMoto: motoTrouvee.nom,
      dateDebut: debut,
      dateFin: fin,
      heureDebut,
      heureFin,
      email,
      telephone,
      prixTotal: prixTotalCalcule,
      statut: 'en attente'
    });

    await nouvelleReservation.save();
    res.status(201).json(nouvelleReservation);

  } catch (error) {
    console.error("❌ Erreur lors de la création de la réservation :", error.message || error);
    res.status(500).json({ message: "Erreur serveur", erreur: error.message || error });
  }
});

// 📋 Récupérer toutes les réservations
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.status(200).json(reservations);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des réservations :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// 🔍 Récupérer une réservation par ID
router.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('clientId motoId');
    if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// ✏️ Modifier une réservation
router.put('/:id', async (req, res) => {
  try {
    const { dateDebut, dateFin, heureDebut, heureFin, motoId } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });

    // 🧮 Recalcul du prix si les dates ou la moto ont changé
    if (dateDebut && dateFin && heureDebut && heureFin && motoId) {
      const debut = new Date(`${dateDebut}T${heureDebut}`);
      const fin = new Date(`${dateFin}T${heureFin}`);
      const nbJours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));

      const motoTrouvee = mongoose.isValidObjectId(motoId)
        ? await Moto.findById(motoId)
        : await Moto.findOne({ nom: { $regex: new RegExp(motoId, 'i') } });

      if (!motoTrouvee)
        return res.status(404).json({ message: "Moto introuvable pour recalcul" });

      const prixTotalCalcule = calculatePrice(motoTrouvee.tarifs, nbJours);
      req.body.prixTotal = prixTotalCalcule;
    }

    const updated = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// 🗑️ Supprimer une réservation
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Réservation introuvable" });
    res.status(200).json({ message: "Réservation supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

module.exports = router;
