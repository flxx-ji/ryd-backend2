// controllers/reservationController.js
const Moto = require('../models/moto');
const { calculatePrice } = require('../utils/calculatePrice');

exports.createReservation = async (req, res) => {
    const { motoId, dateDebut, dateFin } = req.body;

    try {
        const moto = await Moto.findById(motoId);
        if (!moto) {
            return res.status(404).json({ message: "Moto non trouvée." });
        }

        // Calcul du nombre de jours
        const nombreDeJours = Math.ceil(
            (new Date(dateFin) - new Date(dateDebut)) / (1000 * 60 * 60 * 24)
        );

        // Calcul du prix total
        const prixTotal = calculatePrice(
            nombreDeJours,
            moto.tarifJournalier,
            moto.tarifsSpeciaux
        );

        res.status(200).json({
            message: "Prix calculé avec succès.",
            nombreDeJours,
            prixTotal
        });

    } catch (error) {
        console.error("Erreur lors du calcul du prix :", error.message);
        res.status(500).json({ message: "Erreur lors du calcul du prix." });
    }
};
