const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });
}

const token = authHeader.split(" ")[1];

console.log("🟠 Token reçu dans le middleware :", token);

    if (!token) {
        return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token décodé :", decoded);  // Ajoute ce log pour voir le contenu du token
        req.adminId = decoded.id;
        next();
    } catch (error) {
        console.error("❌ Erreur dans le middleware :", error);  // Ajoute ce log pour détecter les problèmes
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expiré. Veuillez vous reconnecter." });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Token invalide." });
        } else {
            return res.status(500).json({ message: "Erreur du serveur." });
        }
    }

}

module.exports = authMiddleware;
