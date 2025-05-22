const express = require('express');
const router = express.Router();
const Moto = require('../models/moto');
const authMiddleware = require('../middleware/authMiddleware');
const parseMotoData = require('../middleware/parseMotoData');
const mongoose = require('mongoose');
const multer = require('multer');

// 🛡️ Toutes les routes sont protégées par un token JWT
router.use(authMiddleware);

// 📦 Multer – Gère l’upload d’images
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, 'uploads/'),
	filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ✅ 1. Ajouter une nouvelle moto (POST)
router.post('/', upload.single('image'), parseMotoData, async (req, res) => {
	try {
		const nouvelleMoto = new Moto({
			...req.body,
			image: req.file ? `/uploads/${req.file.filename}` : '/uploads/default_image.webp'
		});

		const motoEnregistree = await nouvelleMoto.save();
		res.status(201).json(motoEnregistree);
	} catch (error) {
		console.error("❌ Erreur ajout moto :", error);
		res.status(500).json({ message: "Erreur ajout moto", error });
	}
});

// ✅ 2. Récupérer toutes les motos (GET)
router.get('/', async (req, res) => {
	try {
		const motos = await Moto.find();
		res.status(200).json(motos);
	} catch (error) {
		res.status(500).json({ message: "Erreur récupération motos", error });
	}
});

// ✅ 3. Récupérer une moto par ID (GET)
router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "ID invalide" });
		}

		const moto = await Moto.findById(id);
		if (!moto) return res.status(404).json({ message: "Moto non trouvée" });

		res.status(200).json(moto);
	} catch (error) {
		res.status(500).json({ message: "Erreur récupération moto", error });
	}
});

// ✅ 4. Modifier une moto (PUT complet)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const tryParseJSON = (input, fallback = {}) => {
      try {
        return typeof input === 'string' ? JSON.parse(input) : input;
      } catch {
        return fallback;
      }
    };

    // 💡 Prépare les données à mettre à jour
    const updateData = {
      ...req.body,
      tarifs: tryParseJSON(req.body.tarifs, {}),
      caracteristiques: tryParseJSON(req.body.caracteristiques, {}),
      equipements: tryParseJSON(req.body.equipements, [])
    };

    // 📸 Ajout de l'image uniquement si une nouvelle est fournie
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedMoto = await Moto.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedMoto) return res.status(404).json({ message: "Moto non trouvée" });

    res.status(200).json({ message: '✅ Moto mise à jour', updatedMoto });
  } catch (error) {
    console.error("❌ Erreur mise à jour moto :", error);
    res.status(500).json({ message: "Erreur mise à jour moto", error });
  }
});


// ✅ 5. Supprimer une moto (DELETE)
router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "ID invalide" });
		}

		const deleted = await Moto.findByIdAndDelete(id);
		if (!deleted) return res.status(404).json({ message: "Moto non trouvée" });

		res.status(200).json({ message: "Moto supprimée avec succès" });
	} catch (error) {
		res.status(500).json({ message: "Erreur suppression moto", error });
	}
});

// ✅ 6. Modifier un seul champ (PATCH)
router.patch('/:id', async (req, res) => {
	try {
		const { key, value } = req.body;
		if (!key || typeof value === 'undefined') {
			return res.status(400).json({ message: 'Données manquantes' });
		}

		const updated = await Moto.findByIdAndUpdate(
			req.params.id,
			{ $set: { [key]: value } },
			{ new: true }
		);

		if (!updated) return res.status(404).json({ message: "Moto non trouvée" });

		res.json({ message: 'Moto mise à jour', updated });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Erreur serveur' });
	}
});

// ✅ 7. Upload ou mise à jour image moto
router.post('/:id/image', upload.single('image'), async (req, res) => {
	try {
		const filePath = `/uploads/${req.file.filename}`;
		const updated = await Moto.findByIdAndUpdate(
			req.params.id,
			{ image: filePath },
			{ new: true }
		);
		res.json({ message: 'Image mise à jour', image: filePath });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Erreur lors de l'upload." });
	}
});

module.exports = router;
