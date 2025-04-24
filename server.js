// Importation des modules nécessaires
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js'); // Connexion MongoDB
const motoRoutes = require('./routes/motoRoutes');
const reservationRoutes = require('./routes/reservationRoutes.js');
const clientRoutes = require('./routes/clientRoutes.js');
const adminMotoRoutes = require('./routes/adminMotoRoutes.js');
const adminClientRoutes = require('./routes/adminClientRoutes.js');
const adminReservationRoutes = require('./routes/adminReservationRoutes.js');
const adminAuthRoutes = require('./routes/adminAuthRoutes.js');
const multer = require('multer');
const path = require('path'); // Module pour gérer les chemins de fichiers
const pagesRoutes = require('./routes/pagesRoutes');  // Si le fichier est dans le dossier routes


// Chargement des variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

// 📌 Gérer la fermeture propre de la connexion MongoDB
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🟢 Connexion MongoDB fermée proprement (SIGINT)');
    process.exit(0);
});

// Initialisation d'Express
const app = express();

// Middleware JSON
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

// 📂 Servir les fichiers statiques (images) depuis le dossier 'uploads' du backend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware CORS avec autorisation des requêtes depuis tous les domaines (à personnaliser pour la production)
const corsOptions = {
  origin: '*', // Permet d'accepter les requêtes depuis n'importe quelle origine
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));



// Route de test pour vérifier si l'API fonctionne
app.get('/', (req, res) => {
    res.send('🚀 API RYD est en ligne !');
});

//pages routes 
app.use('/api/pages', pagesRoutes);

// Utilisation des routes
app.use('/api/motos', motoRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reservations', reservationRoutes);

// Admin routes
app.use('/api/admin/motos', adminMotoRoutes);
app.use('/api/admin/clients', adminClientRoutes);
app.use('/api/admin/reservations', adminReservationRoutes);
app.use('/api/admin', adminAuthRoutes);

// 📌 Démarrage du serveur
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
        console.log(`✅ Serveur lancé sur le port ${PORT}`);
    });
}

module.exports = app; // Exporte l'application pour Jest
