// utils/checkEnv.js
const requiredEnv = ['PORT', 'JWT_SECRET', 'MONGO_URI', 'STRIPE_SECRET_KEY'];

function checkEnvVariables() {
  const missingEnv = requiredEnv.filter(envVar => !process.env[envVar]);

  if (missingEnv.length > 0) {
    console.error(`❌ Variables d'environnement manquantes : ${missingEnv.join(', ')}`);
    console.error('💡 Vérifie ton fichier .env ou crée un .env.local pour le dev');
    process.exit(1); // Stoppe le serveur si des variables critiques sont absentes
  }
}

module.exports = checkEnvVariables;
