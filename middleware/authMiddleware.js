// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔐 Header Authorization reçu :", authHeader);

  // 🛑 Vérification présence et format du header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "⛔ Aucun token fourni ou format invalide." });
  }

  const token = authHeader.split(" ")[1];
  console.log("🟠 Token extrait :", token);

  // 🛑 Vérifie que la clé secrète est bien définie
  if (!process.env.JWT_SECRET) {
    console.error("❌ Clé JWT_SECRET non définie dans l'environnement !");
    return res.status(500).json({ message: "Erreur de configuration serveur (JWT_SECRET manquant)." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token décodé avec succès :", decoded);

    req.adminId = decoded.id; // Injecte l'id dans la requête pour un usage ultérieur
    next(); // Passe au middleware ou contrôleur suivant
  } catch (error) {
    console.error("❌ Erreur de vérification JWT :", error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "⏰ Token expiré. Veuillez vous reconnecter." });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "❌ Token invalide." });
    }

    return res.status(500).json({ message: "Erreur interne lors de la vérification du token." });
  }
};

module.exports = authMiddleware;
