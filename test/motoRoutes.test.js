const request = require('supertest');
const app = require('../server');
const Admin = require('../models/admin');  // Essaie de mettre un A majuscule si ton fichier s'appelle `Admin.js`

const Moto = require('../models/moto');
const mongoose = require('mongoose');

let token;  // Déclarer la variable token avant tout

beforeAll(async () => {
    await mongoose.connection.dropDatabase(); // Nettoyage complet de la BDD de test
    console.log("🧹 Base de données nettoyée avant les tests");

    await Admin.create({
        nom: "John Wick",
        email: "testadmin@example.com",
        password: "TestPassword123",
        isPermanent: true
    });

    const res = await request(app)
        .post('/api/admin/login')
        .send({
            email: "testadmin@example.com",
            password: "TestPassword123"
        });

    token = res.body.token;

    if (!token) {
        throw new Error("❌ Token non généré. Vérifie ton endpoint d'authentification.");
    }
});



afterAll(async () => {
    await mongoose.connection.close(); // ✅ Fermeture propre de MongoDB
});
describe('🟠 CRUD Motos', () => {

    let motoId;

    test('✅ Ajouter une moto', async () => {
        const res = await request(app)
            .post('/api/admin/motos')
            .set('Authorization', `Bearer ${token}`)  
            .send({
                nom: "Test Moto",
                marque: "Harley Davidson",
                modele: "Street 750",
                annee: 2023,
                couleur: "Noir",
                tarifs: {
                    unJour: 100,
                    troisJours: 280,
                    uneSemaine: 600,
                    quatreCinqJours: 550
                },
                disponible: true
          
            
            });

        expect(res.status).toBe(201);  
        motoId = res.body._id;
    });

    test('✅ Récupérer toutes les motos', async () => {
        const res = await request(app)
            .get('/api/admin/motos')
            .set('Authorization', `Bearer ${token}`);  

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('✅ Modifier une moto', async () => {
        const res = await request(app)
            .put(`/api/admin/motos/${motoId}`)
            .set('Authorization', `Bearer ${token}`)  
            .send({ couleur: "Rouge" });

        expect(res.status).toBe(200);
        expect(res.body.couleur).toBe("Rouge");
    });

    test('✅ Supprimer une moto', async () => {
        const res = await request(app)
            .delete(`/api/admin/motos/${motoId}`)
            .set('Authorization', `Bearer ${token}`);  

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Moto supprimée avec succès");
    });

});

// 🔒 Fermeture propre de MongoDB après les tests
afterAll(async () => {
    await mongoose.connection.close();
});
