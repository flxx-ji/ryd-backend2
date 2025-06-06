const express = require('express');
const router = express.Router();
const Reservation = require('../models/reservation');
const Client = require('../models/client');
const Moto = require('../models/moto');

// 📦 Fonction mail avec Resend
const { sendConfirmationClient, sendNotificationOwner } = require('../utils/sendEmails');

// 🧠 Fonction de calcul de tarif dynamique
function calculerTarif(jours, tarifBase, tarifSemaine) {
  if (jours <= 0) return 0;

  if (jours >= 6 && jours <= 7) {
    return tarifSemaine;
  } else if (jours >= 4 && jours <= 5) {
    return jours * tarifBase * 0.8;
  } else if (jours === 3) {
    return jours * tarifBase * 0.9;
  }

  return jours * tarifBase;
}

// 🛠️ Ajouter une réservation
router.post('/', async (req, res) => {
  try {
    const { clientId, vehiculeId, dateDebut, dateFin, statut = 'en attente' } = req.body;

    const moto = await Moto.findById(vehiculeId);
    if (!moto) return res.status(404).json({ message: "Moto introuvable." });

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client introuvable." });

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const jours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) + 1;

    const prixEstime = calculerTarif(jours, moto.tarifs.unJour, moto.tarifs.uneSemaine);

    const reservation = new Reservation({
      client: clientId,
      vehicule: vehiculeId,
      dateDebut: debut,
      dateFin: fin,
      statut,
      prixEstime
    });

    const nouvelleReservation = await reservation.save();

    // 📩 Envoi des mails
    await sendConfirmationClient(client.email, client.prenom, moto.nom, dateDebut, dateFin, prixEstime);
    await sendNotificationOwner(`${client.prenom} ${client.nom}`, moto.nom, dateDebut, dateFin, prixEstime);

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
