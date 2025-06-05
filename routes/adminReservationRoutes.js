const express = require('express');
const router = express.Router();
const Reservation = require('../../models/reservation');
const Client = require('../../models/client');
const Moto = require('../../models/moto');

// 🧠 Fonction de calcul de tarif dynamique basée sur les règles métiers
function calculerTarif(jours, tarifBase, tarifSemaine) {
  if (jours <= 0) return 0;

  if (jours >= 6 && jours <= 7) {
    return tarifSemaine; // 🔁 6 ou 7 jours = tarif semaine
  } else if (jours >= 4 && jours <= 5) {
    return jours * tarifBase * 0.8; // 🔁 -20% pour 4 à 5 jours
  } else if (jours === 3) {
    return jours * tarifBase * 0.9; // 🔁 -10% pour 3 jours
  }

  return jours * tarifBase; // ✅ Tarif classique
}

// 🛠️ Ajouter une réservation avec calcul tarif automatique
router.post('/', async (req, res) => {
  try {
    const { clientId, vehiculeId, dateDebut, dateFin, statut = 'en attente' } = req.body;

    const moto = await Moto.findById(vehiculeId);
    if (!moto) return res.status(404).json({ message: "Moto introuvable." });

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client introuvable." });

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const temps = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) + 1;

    const prixEstime = calculerTarif(temps, moto.tarifs.unJour, moto.tarifs.uneSemaine);

    const reservation = new Reservation({
      client: clientId,
      vehicule: vehiculeId,
      dateDebut: debut,
      dateFin: fin,
      statut,
      prixEstime
    });

    const nouvelleReservation = await reservation.save();
    res.status(201).json(nouvelleReservation);

  } catch (err) {
    console.error("Erreur lors de la création d'une réservation :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 📥 Lire toutes les réservations
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('client')
      .populate('vehicule');
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ Modifier une réservation
router.put('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Réservation introuvable." });

    const { dateDebut, dateFin, statut } = req.body;

    // Recalcul du prix si dates modifiées
    if (dateDebut && dateFin) {
      const moto = await Moto.findById(reservation.vehicule);
      const jours = Math.ceil((new Date(dateFin) - new Date(dateDebut)) / (1000 * 60 * 60 * 24)) + 1;
      reservation.prixEstime = calculerTarif(jours, moto.tarifs.unJour, moto.tarifs.uneSemaine);
      reservation.dateDebut = dateDebut;
      reservation.dateFin = dateFin;
    }

    if (statut) reservation.statut = statut;

    const maj = await reservation.save();
    res.json(maj);

  } catch (err) {
    console.error("Erreur lors de la modification :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 🗑️ Supprimer une réservation
router.delete('/:id', async (req, res) => {
  try {
    const suppr = await Reservation.findByIdAndDelete(req.params.id);
    if (!suppr) return res.status(404).json({ message: "Réservation introuvable." });
    res.json({ message: "Réservation supprimée." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
