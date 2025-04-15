// test/calculatePrice.test.js

const { calculatePrice } = require("../utils/calculatePrice");

const tarifJournalier = 120; // Exemple de tarif journalier
const tarifsSpeciaux = {
    troisJours: 360,         // Exemple : 3 jours = 360€
    uneSemaine: 700          // Exemple : 1 semaine = 700€
};

describe("🟠 Système de gestion dynamique des prix", () => {
    
    test("✅ 1 jour = tarif journalier classique", () => {
        expect(calculatePrice(1, tarifJournalier, tarifsSpeciaux)).toBe(120);
    });

    test("✅ 3 jours = tarif spécial 3 jours", () => {
        expect(calculatePrice(3, tarifJournalier, tarifsSpeciaux)).toBe(360);
    });

    test("✅ 4 jours = tarif spécial 4-5 jours avec réduction de -20%", () => {
        expect(calculatePrice(4, tarifJournalier, tarifsSpeciaux)).toBe(384); // 120€ x 4 x 0.8
    });

    test("✅ 5 jours = tarif spécial 4-5 jours avec réduction de -20%", () => {
        expect(calculatePrice(5, tarifJournalier, tarifsSpeciaux)).toBe(480); // 120€ x 5 x 0.8
    });

    test("✅ 7 jours = tarif spécial 1 semaine", () => {
        expect(calculatePrice(7, tarifJournalier, tarifsSpeciaux)).toBe(700);
    });

    test("❗ Nombre négatif de jours = Retourne 0€ (cas extrême)", () => {
        expect(calculatePrice(-2, tarifJournalier, tarifsSpeciaux)).toBe(0);
    });

    test("✅ Aucun tarif spécial trouvé = Tarif journalier classique", () => {
        expect(calculatePrice(2, tarifJournalier, tarifsSpeciaux)).toBe(240); // 120€ x 2
    });
});
