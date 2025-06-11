function tryParseJSON(input, fallback = {}) {
	try {
		return typeof input === 'string' ? JSON.parse(input) : input;
	} catch {
		return fallback;
	}
}

function parseMotoData(req, res, next) {
     
    // 🔒 Ignore les méthodes qui n'ont pas de body
  if (['GET', 'DELETE'].includes(req.method)) {
    return next();
  }


	req.body.tarifs = tryParseJSON(req.body.tarifs, {});
	req.body.caracteristiques = tryParseJSON(req.body.caracteristiques, {});
	req.body.equipements = tryParseJSON(req.body.equipements, []);

	// 🧠 Si l'utilisateur n'a rien mis → on met une liste par défaut
	if (!Array.isArray(req.body.equipements) || req.body.equipements.length === 0) {
		req.body.equipements = [
			"Casque",
			"Gants",
			"GPS",
			"GoPro",
			"Combi Pluie",
			"Carte sd"
		];
	}

	next(); // 🔁 Passe à la suite
}

// ✅ Export propre et sans crash
module.exports = parseMotoData;
