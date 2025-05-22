 

function tryParseJSON(input, fallback = {}) {
	try {
		return typeof input === 'string' ? JSON.parse(input) : input;
	} catch {
		return fallback;
	}
}

module.exports = (req, res, next) => {
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
};
module.exports = parseMotoData;