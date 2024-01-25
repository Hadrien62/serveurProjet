const mongoose = require('mongoose');

// Définition du schéma pour la collection "person"
const produit2Schema = new mongoose.Schema({
    numberId: String,
    name: String,
    pret: Date,
    nbJour: Number,
    image1: String,
    reserved: Boolean,
    id_user_reserved : String,
    is_late: Boolean
});

// Création du modèle basé sur le schéma
const Produit2 = mongoose.model('produit2', produit2Schema);

module.exports = Produit2;