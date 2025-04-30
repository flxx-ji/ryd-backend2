// Importation des modules nécessaires
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db.js');
const checkEnvVariables = require('./utils/checkEnv.js');

// Routes
const motoRoutes = require('./routes/motoRoutes');
const reservationRoutes = require('./routes/reservationRoutes.js');
const clientRoutes = require('./routes/clientRoutes.js');
const adminMotoRoutes = require('./routes/adminMotoRoutes.js');
const adminClientRoutes = require('./routes/adminClientRoutes.js');
const adminReservationRoutes = require('./routes/adminReservationRoutes.js');
const adminAuthRoutes = require('./routes/adminAuthRoutes.js');
const pagesRoutes = require('./routes/pagesRoutes');
const stripeRoutes = require('./routes/stripeRoutes');

// 🔒 Vérification des variables d'environnement
checkEnvVariables();

// 🌍 Chargement des variables d'environnement
dotenv.config();

// 🔌 Connexion à la base de données
connectDB();

// ✅ Initialisation d'Express
const app = express();

// ⚠️ Middleware Stripe Webhook - DOIT être défini **avant** express.json()
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }), // brut, requis par Stripe
  stripeRoutes
);

// 🛡️ CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 📂 Fichiers statiques (uploads d’images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🧠 Middleware JSON (⚠️ DOIT être après le webhook Stripe)
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

// 📦 Routes API normales
app.get('/', (req, res) => {
  res.send('🚀 API RYD est en ligne !');
});

app.use('/api/stripe', stripeRoutes); // uniquement pour /create-checkout-session
app.use('/api/pages', pagesRoutes);
app.use('/api/motos', motoRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reservations', reservationRoutes);

// 🔐 Admin routes
app.use('/api/admin/motos', adminMotoRoutes);
app.use('/api/admin/clients', adminClientRoutes);
app.use('/api/admin/reservations', adminReservationRoutes);
app.use('/api/admin', adminAuthRoutes);

// 💥 Gestion propre de SIGINT (CTRL+C)
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🟢 Connexion MongoDB fermée proprement (SIGINT)');
  process.exit(0);
});

// 🚀 Démarrage du serveur
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur le port ${PORT}`);
  });
}

module.exports = app;
