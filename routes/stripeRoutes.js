const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Reservation = require('../models/reservation'); // ⬅️ Tu vas enregistrer la réservation une fois le paiement validé

// ➡️ Créer une session Checkout
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { moto, customer, dates } = req.body;

    const start = new Date(dates.debut);
    const end = new Date(dates.fin);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;

    const pricePerDay = moto.tarifs.unJour;
    const totalPrice = pricePerDay * days;

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
            unit_amount: totalPrice * 100 
          },
          quantity: 1
        }
      ],
      customer_email: customer.email,
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel'
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Erreur Stripe :', err);
    res.status(500).json({ error: 'Erreur Stripe' });
  }
});

// ➡️ Réception du Webhook Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET; // La signature secrète de ton webhook
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Erreur de vérification Webhook :', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 🎯 On réagit uniquement à l'événement checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log('✅ Paiement réussi pour :', session.customer_email);
    
    // ICI ➔ Tu pourras rajouter la logique pour confirmer la réservation en BDD si besoin
    // Exemples :
    // 1. Chercher la réservation correspondante au customer_email
    // 2. Passer son statut en "confirmée"
  }

  res.json({ received: true });
});

module.exports = router;
