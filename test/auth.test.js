const request = require('supertest');
const app = require('../server'); // Ton serveur Express
const Admin = require('../models/admin');
const mongoose = require('mongoose');


describe('🟠 Authentification Admin', () => {
    
    let token;

    beforeAll(async () => {

        await mongoose.connection.dropDatabase(); // Nettoie toute la base de données avant les tests
    console.log("🧹 Base de données nettoyée avant les tests");

        // Crée un compte admin fictif pour les tests
        await Admin.create({
            nom: "Test Admin",
            email: "testadmin@example.com",
            password: "TestPassword123"
        });
    });

    test('✅ Inscription réussie', async () => {
        const res = await request(app)
            .post('/api/admin/register')
            .send({
                nom: "Admin Test",
                email: "admin@test.com",
                password: "Test123",
                isPermanent: false
            });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("admin");
    });

    test('✅ Connexion réussie', async () => {
        const res = await request(app)
            .post('/api/admin/login')
            .send({
                email: "testadmin@example.com",
                password: "TestPassword123"
            });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        token = res.body.token; // Sauvegarde du token pour les autres tests
    });

    test('❌ Connexion échouée - Mot de passe incorrect', async () => {
        const res = await request(app)
            .post('/api/admin/login')
            .send({
                email: "testadmin@example.com",
                password: "WrongPassword"
            });
        expect(res.status).toBe(400);
    });

    afterAll(async () => {
        const result = await Admin.deleteMany({ isPermanent: false }); // Ne supprime pas l' admin principal
        console.log(`🟠 Admins supprimés : ${result.deletedCount}`);
        await mongoose.connection.close(); // Remplace .disconnect() par .close()
    console.log("🟢 Connexion MongoDB fermée avec succès");
    });
});
