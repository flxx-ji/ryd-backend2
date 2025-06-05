// 📁 utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,       // 📧 Adresse d'envoi (ex: rydcustommotorcycles25@gmail.com)
    pass: process.env.EMAIL_PASS        // 🔐 Mot de passe (ou App Password si 2FA activée)
  }
});

/**
 * Envoie un mail au propriétaire quand une réservation est confirmée
 * @param {Object} reservation - Objet Reservation mongoose
 */
async function notifyOwner(reservation) {
  if (!reservation) return console.warn("❗ Aucune réservation fournie à notifyOwner");

  const {
    nomMoto,
    dateDebut,
    dateFin,
    prixTotal,
    email,
    telephone
  } = reservation;

  const mailOptions = {
    from: `"Ride Your Dream 🔧" <${process.env.EMAIL_FROM}>`,
    to: process.env.OWNER_EMAIL,
    subject: `💸 Nouvelle réservation confirmée – ${nomMoto}`,
    html: `
      <h2>Nouvelle réservation confirmée</h2>
      <p><strong>Moto :</strong> ${nomMoto}</p>
      <p><strong>Dates :</strong> du ${new Date(dateDebut).toLocaleDateString()} au ${new Date(dateFin).toLocaleDateString()}</p>
      <p><strong>Client :</strong> ${email} (${telephone})</p>
      <p><strong>Montant payé :</strong> ${prixTotal} €</p>
    `
  };

  try {
    console.log("📧 Envoi email à", process.env.OWNER_EMAIL);

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé au propriétaire :", info.response);
  } catch (error) {
    console.error("❌ Erreur envoi mail au propriétaire :", error);
  }
}

async function notifyClient({ nomMoto, dateDebut, dateFin, prixTotal, email }) {
  const mailOptions = {
    from: `"Ride Your Dream" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `✅ Confirmation de votre réservation – ${nomMoto}`,
    html: `
      <h2>Merci pour votre réservation !</h2>
      <p>Votre moto <strong>${nomMoto}</strong> est réservée.</p>
      <p><strong>Dates :</strong> du ${new Date(dateDebut).toLocaleDateString()} au ${new Date(dateFin).toLocaleDateString()}</p>
      <p><strong>Total :</strong> ${prixTotal} €</p>
      <br>
      <p>À bientôt sur la route 🏍️</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📨 Mail envoyé au client");
  } catch (error) {
    console.error("❌ Erreur mail client :", error);
  }
}

module.exports = { notifyOwner, notifyClient};
