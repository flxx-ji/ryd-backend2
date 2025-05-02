const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Reservation = require('../models/reservation');

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

    // 🔍 Sécurité : s'assurer que le prix est un entier positif
if (isNaN(totalPrice) || totalPrice <= 0) {
    console.error("❌ Prix invalide pour Stripe :", totalPrice);
    return res.status(400).json({ error: "Prix invalide. Vérifie les tarifs ou les dates." });
  }
  
   
  

    // 💾 Étape 1.1 : on crée la réservation dans MongoDB
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

    // 💳 Étape 1.2 : on crée la session Stripe avec l'ID de la 
    
    
  

if (isNaN(totalPrice) || totalPrice <= 0) {
  console.error("❌ Erreur: totalPrice invalide", totalPrice);
  return res.status(400).json({ error: "Prix total invalide" });
}

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
      
      success_url: `http://localhost:5173/success?moto=${encodeURIComponent(moto.nom)}&debut=${dates.debut}&fin=${dates.fin}&prix=${Math.round(totalPrice)}`
,
      cancel_url: 'http://localhost:5173/cancel'
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error('❌ Erreur Stripe (Checkout) :', err);
    res.status(500).json({ error: 'Erreur Stripe' });
  }
});

// ✅ Étape 2 : Webhook appelé par Stripe après le paiement
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Webhook invalide :', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const reservationId = session.metadata.reservationId;
const email = session.metadata.email;
const motoNom = session.metadata.nomMoto;
const dateDebut = new Date(session.metadata.debut);
const dateFin = new Date(session.metadata.fin);
const heureDebut = session.metadata.heureDebut;
const heureFin = session.metadata.heureFin;

    try {
      const reservation = await Reservation.findById(reservationId);
      if (reservation) {
        reservation.statut = 'confirmée';
        await reservation.save();
        console.log('✅ Réservation confirmée pour', reservation.email);
      } else {
        console.warn('⚠️ Aucune réservation trouvée pour ID :', reservationId);
      }
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour de la réservation :', err);
    }
  }

  res.json({ received: true });
});

module.exports = router;
