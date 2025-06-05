const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Reservation = require('../models/reservation');

const FRONT_URL = process.env.FRONT_URL || 'http://localhost:5173'; // 👈 par défaut local

// ➕ Étape 1 : Créer la session Stripe
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { moto, customer, dates } = req.body;

    const start = new Date(dates.debut);
    const end = new Date(dates.fin);

    if (end <= start) {
      console.error("❌ Erreur : la date de fin est avant la date de début");
      return res.status(400).json({ error: "La date de fin doit être après la date de début." });
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    const pricePerDay = Number(moto.tarifs.unJour || 0);
    const totalPrice = pricePerDay * days;

    if (isNaN(totalPrice) || totalPrice <= 0) {
      console.error("❌ Prix invalide pour Stripe :", totalPrice);
      return res.status(400).json({ error: "Prix invalide. Vérifie les tarifs ou les dates." });
    }

    const newReservation = await Reservation.create({
      nomMoto: moto.nom,
      motoId: moto._id || null,
      clientId: customer._id || null,
      email: customer.email,
      telephone: customer.telephone || 'non fourni',
      dateDebut: start,
      dateFin: end,
      heureDebut: dates.heureDebut || '09:00',
      heureFin: dates.heureFin || '18:00',
      prixTotal: totalPrice,
      statut: 'en attente'
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${moto.nom} (${moto.modele})`,
              description: `Location de ${days} jour(s) - du ${dates.debut} au ${dates.fin}`
            },
            unit_amount: Math.round(totalPrice * 100)
          },
          quantity: 1
        }
      ],
      customer_email: customer.email,
      metadata: {
        reservationId: newReservation._id.toString(),
        email: customer.email,
        nomMoto: moto.nom,
        debut: dates.debut,
        fin: dates.fin,
        heureDebut: dates.heureDebut,
        heureFin: dates.heureFin
      },
      success_url: `${FRONT_URL}/success?moto=${encodeURIComponent(moto.nom)}&debut=${dates.debut}&fin=${dates.fin}&prix=${Math.round(totalPrice)}`,
      cancel_url: `${FRONT_URL}/cancel`
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error('❌ Erreur Stripe (Checkout) :', err);
    res.status(500).json({ error: 'Erreur Stripe' });
  }
});

// ➕ Étape 2 : Webhook Stripe pour confirmer le paiement
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Signature invalide du webhook Stripe :", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 🎯 On traite uniquement l'événement de paiement réussi
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const reservationId = session.metadata?.reservationId;

    try {
      const updated = await Reservation.findByIdAndUpdate(reservationId, {
        statut: 'confirmé'
      }, { new: true });

      if (updated) {
        console.log(`✅ Paiement confirmé pour réservation ${updated._id}`);
      } else {
        console.warn("⚠️ Réservation non trouvée :", reservationId);
      }
    } catch (error) {
      console.error("❌ Erreur de mise à jour de réservation après paiement :", error);
    }
  }

  res.status(200).json({ received: true });
});


module.exports = router;
