const express = require('express');
const router = express.Router();
const Client = require('../models/client');
const authMiddleware = require('../middleware/authMiddleware'); // 🔒 Ajout du middleware de sécurité
const mongoose = require('mongoose');

// 📌 Toutes les routes ci-dessous sont protégées
router.use(authMiddleware);

// 📌 Récupérer tous les clients (GET)
router.get('/', async (req, res) => {
    try {
        const clients = await Client.find();
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des clients", error });
    }
});

// 📌 Récupérer un client par ID (GET)
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "ID invalide" });
        }
        const client = await Client.findById(req.params.id);
        if (!client) return res.status(404).json({ message: "Client non trouvé" });

        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du client", error });
    }
});

// 📌 Ajouter un nouveau client (POST)
router.post('/', async (req, res) => {
    try {
        const { nom, prenom, email, telephone, permis } = req.body;
        if (!nom || !prenom || !email || !telephone || !permis) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        const nouveauClient = new Client({ nom, prenom, email, telephone, permis });
        const clientEnregistre = await nouveauClient.save();
        res.status(201).json(clientEnregistre);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'ajout du client", error });
    }
});

// 📌 Modifier un client (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID invalide" });
        }

        const { nom, prenom, email, telephone, permis } = req.body;
        const client = await Client.findByIdAndUpdate(id, { nom, prenom, email, telephone, permis }, { new: true });

        if (!client) return res.status(404).json({ message: "Client non trouvé" });

        res.status(200).json({ message: "Client mis à jour avec succès", client });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du client", error });
    }
});

// 📌 Supprimer un client (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID invalide" });
        }

        const client = await Client.findByIdAndDelete(id);
        if (!client) return res.status(404).json({ message: "Client non trouvé" });

        res.status(200).json({ message: "Client supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du client", error });
    }
});

module.exports = router;
