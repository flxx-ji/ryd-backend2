# 🏍️ Free Torque - Backend API

> 🧪 Projet backend REST pour le site Free Torque (location de motos)

Ce backend gère les données des **clients**, **motos**, et **réservations**, avec vérification des conflits, envoi d'e-mails via **Resend**, et logique de tarification.

---

## 🎯 Objectif

- Gérer un vrai système de **réservation de véhicule**
- Calculer dynamiquement les tarifs selon les durées
- Empêcher les **réservations en doublon**
- Offrir un backend modulaire réutilisable

---

## ⚙️ Stack utilisée

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) + Mongoose
- [Resend](https://resend.com/) pour les e-mails
- [Railway](https://railway.app/) pour l’hébergement

---

## ✨ Fonctionnalités backend

- CRUD : motos, clients, réservations
- Envoi automatique d’e-mails à la création d’une réservation
- Vérification des doublons par plage horaire
- Calcul automatique du tarif avec règles métier (1, 3, 5 jours, etc.)
- Routes publiques et privées (admin)

---

## 🚀 Structure du projet

