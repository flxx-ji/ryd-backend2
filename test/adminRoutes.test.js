const mongoose = require('mongoose');
const Admin = require('../models/admin'); 
const request = require('supertest');
const app = require('../server'); 

describe('🟠 Routes Admin Protégées', () => {
    let token;

    beforeAll(async () => {
        await mongoose.connection.dropDatabase();
        console.log("🧹 Base de données nettoyée avant les tests");
        const existingAdmin = await Admin.findOne({ email: "testadmin@example.com" });

        if (!existingAdmin) {
            await Admin.create({
                nom: "John Wick",
                email: "testadmin@example.com",
                password: "TestPassword123",
                isPermanent: true
            });
            console.log("✅ Admin inséré dans la BDD de test.");
        }

        const res = await request(app)
            .post('/api/admin/login')
            .send({
                email: "testadmin@example.com",
                password: "TestPassword123"
            });

        console.log("🟠 Token reçu dans le `beforeAll()` :", res.body.token);

        token = res.body.token;

        if (!token) {
            throw new Error("❌ Token non généré. Vérifie ton endpoint d'authentification.");
        }
    });

    test('✅ Accès autorisé avec token valide', async () => {
        const res = await request(app)
            .get('/api/admin/motos')
            .set('Authorization', `Bearer ${token}`);
        console.log("🟠 Token dans le test :", token);

        expect(res.status).toBe(200);
    });

    test('❌ Accès refusé sans token', async () => {
        const res = await request(app)
            .get('/api/admin/motos');
        expect(res.status).toBe(401);
    });

    test('❌ Accès refusé avec token invalide', async () => {
        const res = await request(app)
            .get('/api/admin/motos')
            .set('Authorization', 'Bearer fakeToken');
        expect(res.status).toBe(401);
    });

    afterAll(async () => {
        await mongoose.connection.close();
        console.log("🟢 Connexion MongoDB fermée avec succès");
    });
});
