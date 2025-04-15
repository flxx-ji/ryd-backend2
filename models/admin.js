const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, "Le nom est requis"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "L'email est requis"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "L'email fourni n'est pas valide"]
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est requis"]
    },
    isPermanent: {type:Boolean, default:false}
}, { timestamps: true });

// 🔐 Hash du mot de passe avant sauvegarde
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
// Méthode pour vérifier le mot de passe lors de la connexion
adminSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

  
module.exports = mongoose.model('admin', adminSchema);