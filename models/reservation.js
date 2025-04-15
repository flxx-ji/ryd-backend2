const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    motoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Moto',
        required: true
    },
    nomMoto: {
        type: String,
        required: true
    },
    dateDebut: {
        type: Date,
        required: true
    },
    dateFin: {
        type: Date,
        required: true
    },
    heureDebut: {
        type: String,
        required: true
    },
    heureFin: {
        type: String,
        required: true
    },
    email: {       // ➤ Nouveau champ
        type: String,
        required: true
    },
    telephone: {   // ➤ Nouveau champ
        type: String,
        required: true
    },
    prixTotal: {
        type: Number,
        required: true
    },
    statut: {
        type: String,
        enum: ['en attente', 'confirmée', 'annulée'],
        default: 'en attente'
    }
}, { timestamps: true });

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
