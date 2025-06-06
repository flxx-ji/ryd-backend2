// utils/sendEmails.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// 📤 Mail client : confirmation de réservation
async function sendConfirmationClient(email, nomClient, nomMoto, dateDebut, dateFin, prix) {
  try {
    await resend.emails.send({
      from: 'resa@ryd-custom.fr',
      to: email,
      subject: 'Confirmation de votre réservation ✔',
      html: `
        <h2>Merci ${nomClient} 🙏</h2>
        <p>Votre réservation de la moto <strong>${nomMoto}</strong> a bien été prise en compte.</p>
        <p><strong>Dates :</strong> du ${dateDebut} au ${dateFin}</p>
        <p><strong>Montant estimé :</strong> ${prix} €</p>
        <br/>
        <p>Nous restons à votre disposition !</p>
      `,
    });
  } catch (error) {
    console.error("❌ Erreur mail client :", error);
  }
}

// 📤 Mail owner : alerte nouvelle réservation
async function sendNotificationOwner(nomClient, nomMoto, dateDebut, dateFin, prix) {
  try {
    await resend.emails.send({
      from: 'alerte@ryd-custom.fr',
      to: 'owner@ryd-custom.fr', // à remplacer par le mail du client pro
      subject: '📩 Nouvelle réservation reçue',
      html: `
        <h2>Nouvelle réservation reçue !</h2>
        <p><strong>Client :</strong> ${nomClient}</p>
        <p><strong>Moto :</strong> ${nomMoto}</p>
        <p><strong>Dates :</strong> du ${dateDebut} au ${dateFin}</p>
        <p><strong>Montant estimé :</strong> ${prix} €</p>
      `,
    });
  } catch (error) {
    console.error("❌ Erreur mail owner :", error);
  }
}

module.exports = {
  sendConfirmationClient,
  sendNotificationOwner
};
