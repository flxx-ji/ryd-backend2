

// 🔁 Fonction utilitaire pour parser une chaîne JSON en objet
function tryParseJSON(input, fallback = {}) {
  try {
    return typeof input === 'string' ? JSON.parse(input) : input;
  } catch {
    return fallback;
  }
}

// 🧠 Middleware de parsing des champs complexes pour les motos
function parseMotoData(req, res, next) {
  // 🔒 Ignore les méthodes sans corps (GET, DELETE)
  if (['GET', 'DELETE'].includes(req.method)) {
    return next();
  }

  // 🔄 Tente de parser les champs JSON reçus sous forme de string
  req.body.tarifs = tryParseJSON(req.body.tarifs, {});
  req.body.caracteristiques = tryParseJSON(req.body.caracteristiques, {});
  req.body.equipements = tryParseJSON(req.body.equipements, []);

  // ✅ Si aucun équipement n’est fourni, injecte des valeurs par défaut
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

  next(); // 🔁 Passe au contrôleur suivant
}

module.exports = parseMotoData;
