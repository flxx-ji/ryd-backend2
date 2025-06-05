const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// 👇 Permet d’avoir le corps brut requis par Stripe
router.post('/', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Webhook signature invalide:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Quand un paiement est terminé
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log("✅ Paiement confirmé pour :", session.metadata.nomMoto);
    console.log("📧 Email client :", session.metadata.email);
    console.log("📆 Dates :", session.metadata.debut, '→', session.metadata.fin);

    // ici tu pourrais : envoyer un mail, mettre à jour une BDD, notifier Slack, etc.
  }

  res.status(200).json({ received: true });
});

module.exports = router;
