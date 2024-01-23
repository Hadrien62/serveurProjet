 const mongoose = require('mongoose');

// Définition du schéma pour la collection "person"
const userSchema = new mongoose.Schema({
    admin: Boolean,
    numberId: String,
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    historic: Array
});

// Création du modèle basé sur le schéma
const User = mongoose.model('person', userSchema);

module.exports = User;