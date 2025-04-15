// 📌 routes/adminReservationRoutes.js
const express = require('express');
const router = express.Router();
const Reservation = require('../models/reservation');
const authMiddleware = require('../middleware/authMiddleware'); // 🔒 Ajout du middleware de sécurité
const Moto = require('../models/moto');
const Client = require('../models/client');


// Toutes les routes ci-dessous sont protégées
router.use(authMiddleware);

// ✅ GET - Récupérer toutes les réservations (avec détails des motos et clients)
router.get('/', async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate('motoId', 'nom marque modele couleur')
            .populate('clientId', 'nom prenom email telephone');
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des réservations", error });
    }
});

// ✅ GET by ID - Récupérer une réservation précise
router.get('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate('motoId', 'nom marque modele couleur')
            .populate('clientId', 'nom prenom email telephone');
        if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });
        res.status(200).json(reservation);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de la réservation", error });
    }
});

// ✅ POST - Créer une nouvelle réservation
router.post('/', async (req, res) => {
    try {
        const { clientId, motoId, nomMoto, dateDebut, dateFin, statut, prixTotal } = req.body;

        // Vérification des champs obligatoires
        if (!clientId || !motoId || !nomMoto || !dateDebut || !dateFin || !prixTotal) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        const nouvelleReservation = new Reservation({
            clientId,
            motoId,
            nomMoto,
            dateDebut,
            dateFin,
            statut,
            prixTotal
        });

        await nouvelleReservation.save();
        res.status(201).json(nouvelleReservation);

    } catch (error) {
        console.error("❌ Erreur lors de la création de la réservation :", error);
        res.status(500).json({ message: "Erreur lors de la création de la réservation", error });
    }
});


// ✅ PUT - Modifier une réservation
router.put('/:id', async (req, res) => {
    try {
        const { dateDebut, dateFin, statut } = req.body;
        const reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            { dateDebut, dateFin, statut },
            { new: true, runValidators: true }
        );
        if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });
        res.status(200).json(reservation);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la modification de la réservation", error });
    }
});

// ✅ DELETE - Supprimer une réservation
router.delete('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });
        res.status(200).json({ message: "Réservation supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de la réservation", error });
    }
});

module.exports = router;
