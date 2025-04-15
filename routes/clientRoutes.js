const express = require('express');
const router = express.Router();
const Client = require('../models/client');

// 📌 Récupérer tous les clients (GET)
router.get('/', async (req, res) => {
    try {
        const clients = await Client.find();
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des clients", error });
    }
});

//Création du client

router.post('/', async (req, res) => {
    try {
        const { nom, prenom, email, telephone, permis } = req.body;

        // Vérifier si l'email existe déjà
        let client = await Client.findOne({ email });
        if (client) {
            return res.status(400).json({ message: "Un client avec cet email existe déjà." });
        }

        // Créer un nouveau client
        client = new Client({ nom,prenom, email, telephone, permis });
        await client.save();

        res.status(201).json(client);
    } catch (error) {
        console.error("❌ Erreur lors de la création du client :", error);
        res.status(500).json({ message: "Erreur serveur", error });
    }
});


//modification client 

router.put('/:id', async (req, res) => {
    try {
        const { nom, prenom, email, telephone, permis } = req.body;
        const client = await Client.findByIdAndUpdate(
            req.params.id,
            { nom, prenom,  email, telephone, permis },
            { new: true, runValidators: true }
        );

        if (!client) return res.status(404).json({ message: "Client non trouvé" });

        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du client", error });
    }
});

// 📌 Récupérer un client par ID (GET)
router.get('/:id', async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) return res.status(404).json({ message: "Client introuvable" });
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du client", error });
    }
});

// 📌 Supprimer un client (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) return res.status(404).json({ message: "Client introuvable" });
        res.status(200).json({ message: "Client supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du client", error });
    }
});
module.exports = router;