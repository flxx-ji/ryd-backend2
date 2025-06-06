const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Reservation = require('../models/reservation'); // 💾 BDD
const sendEmails = require('../utils/sendEmails'); // 📤 Nouveau système d'envoi Resend
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// ⚠️ Le body brut est nécessaire ici → cette route DOIT être branchée avec express.raw dans server.js
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Webhook signature invalide:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Quand Stripe confirme un paiement
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const reservationId = session.metadata?.reservationId;

    console.log("✅ Paiement confirmé pour :", session.metadata.nomMoto);
    console.log("📧 Email client :", session.metadata.email);
    console.log("📆 Dates :", session.metadata.debut, '→', session.metadata.fin);

    try {
      const updated = await Reservation.findByIdAndUpdate(
        reservationId,
        { statut: 'confirmé' },
        { new: true }
      );

      if (updated) {
        console.log(`🔄 Réservation ${updated._id} confirmée en BDD.`);

        // ✉️ Envoi du mail avec Resend
        await sendEmails({
          to: process.env.OWNER_EMAIL,
          subject: `💸 Nouvelle réservation confirmée – ${updated.nomMoto}`,
          html: `
            <h2>Nouvelle réservation confirmée</h2>
            <p><strong>Moto :</strong> ${updated.nomMoto}</p>
            <p><strong>Dates :</strong> du ${new Date(updated.dateDebut).toLocaleDateString()} au ${new Date(updated.dateFin).toLocaleDateString()}</p>
            <p><strong>Client :</strong> ${updated.email} (${updated.telephone})</p>
            <p><strong>Montant payé :</strong> ${updated.prixTotal} €</p>
          `
        });

        console.log("📨 Email envoyé au propriétaire.");
      } else {
        console.warn("⚠️ Réservation introuvable pour ID :", reservationId);
      }
    } catch (error) {
      console.error("❌ Erreur mise à jour ou email :", error);
    }
  }

  res.status(200).json({ received: true });
});

module.exports = router;
