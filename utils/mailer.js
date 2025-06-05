// 📁 utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM, // expéditeur
    pass: process.env.EMAIL_PASS, // mot de passe d’app Gmail
  },
});

async function notifyOwner(reservation) {
  const {
    nomMoto,
    dateDebut,
    dateFin,
    prixTotal,
    email,
    telephone
  } = reservation;

  const mailOptions = {
    from: `"RYD Paiement" <${process.env.EMAIL_FROM}>`,
    to: process.env.OWNER_EMAIL, // propriétaire
    subject: `💸 Nouvelle réservation confirmée – ${nomMoto}`,
    html: `
      <h2>Nouvelle réservation confirmée</h2>
      <p><strong>Moto :</strong> ${nomMoto}</p>
      <p><strong>Dates :</strong> du ${new Date(dateDebut).toLocaleDateString()} au ${new Date(dateFin).toLocaleDateString()}</p>
      <p><strong>Client :</strong> ${email} (${telephone})</p>
      <p><strong>Montant :</strong> ${prixTotal} €</p>
    `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { notifyOwner };
