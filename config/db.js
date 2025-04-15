const mongoose = require('mongoose'); // Importation de Mongoose pour interagir avec MongoDB
require('dotenv').config(); // Chargement des variables d'environnement depuis le fichier .env

// Affiche l'URI utilisée pour la connexion
console.log(`🟠 URI MongoDB utilisée : ${process.env.MONGO_URI}`);

// Connexion à MongoDB
const connectDB = async () => {
    try {
        // Connexion avec les options récentes recommandées par Mongoose
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Depuis Mongoose v6+, ces options ne sont plus nécessaires :
            // useNewUrlParser, useUnifiedTopology, useCreateIndex, useFindAndModify
        });

        // Affiche un message si la connexion réussit
        console.log(`✅ MongoDB connecté : ${mongoose.connection.name} à l'adresse ${mongoose.connection.host}`);

    } catch (error) {
        console.error(`❌ Erreur de connexion à MongoDB : ${error.message}`);
        process.exit(1); // Quitte le processus en cas d'échec
    }
};

module.exports = connectDB; // Exportation de la fonction pour l'utiliser dans `server.js`
