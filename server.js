// 🌍 Chargement des variables d'environnement (à faire TOUT EN HAUT)
const dotenv = require('dotenv');
dotenv.config();

// 📦 Imports
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db.js');
const checkEnvVariables = require('./utils/checkEnv.js');
const Admin = require('./models/admin');
const bcrypt = require('bcrypt');

// 🛣️ Import des routes
const motoRoutes = require('./routes/motoRoutes');
const reservationRoutes = require('./routes/reservationRoutes.js');
const clientRoutes = require('./routes/clientRoutes.js');
const adminMotosRoutes = require('./routes/adminMotosRoutes.js');
const adminClientRoutes = require('./routes/adminClientRoutes.js');
const adminReservationRoutes = require('./routes/adminReservationRoutes.js');
const adminAuthRoutes = require('./routes/adminAuthRoutes.js');
const pagesRoutes = require('./routes/pagesRoutes');
const stripeRoutes = require('./routes/stripeRoutes');

// ✅ Vérification des variables d'env
checkEnvVariables();

// 🔌 Connexion à la base MongoDB
connectDB();

// ✅ Initialisation d'Express
const app = express();

 app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  require('./routes/stripeWebhook')
);

// 🌍 CORS
app.use(cors({
  origin: '*',
  credentials:true,

  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 📂 Statique : images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/stripe/webhook', require('./routes/stripeRoutes.js'));




// 🧠 JSON Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🌐 Routes API
app.get('/', (req, res) => {
  res.send('🚀 API RYD est en ligne !');
});
app.use('/api/stripe', stripeRoutes);
app.use('/api/motos', motoRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reservations', reservationRoutes);

// 🔐 Routes admin
app.use('/api/admin/motos', adminMotosRoutes);
app.use('/api/admin/clients', adminClientRoutes);
app.use('/api/admin/reservations', adminReservationRoutes);
app.use('/api/admin', adminAuthRoutes);

// 🔌 Gestion propre SIGINT
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🟢 Connexion MongoDB fermée proprement (SIGINT)');
  process.exit(0);
});

// 🚀 Lancer le serveur
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur le port ${PORT}`);
  });
}

module.exports = app;
