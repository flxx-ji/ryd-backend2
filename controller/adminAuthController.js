const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');

// 🔒 Enregistrer un nouvel admin (manuel, via Postman uniquement)
exports.register = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe sont requis" });
    }

    try {
        const adminExiste = await Admin.findOne({ email });
        if (adminExiste) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }

        const nouvelAdmin = new Admin({ email, password });
        await nouvelAdmin.save();

        res.status(201).json({ message: "Admin créé avec succès !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création de l'admin", error });
    }
};

// 🔑 Login - Connexion de l'admin
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "Admin non trouvé" });
        }

        const passwordMatch = await admin.comparePassword(password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

        // Génération du token
        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET, // Utilise une clé secrète définie dans le fichier .env
            { expiresIn: '2h' } // Durée de validité du token
        );
        console.log("✅ Token généré :", token);
        res.status(200).json({ message: "Connexion réussie", token });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la connexion", error });
    }
};
