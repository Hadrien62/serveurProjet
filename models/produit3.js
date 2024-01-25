const mongoose = require('mongoose');

// Définition du schéma pour la collection "person"
const produit3Schema = new mongoose.Schema({
    numberId: String,
    name: String,
    pret: Date,
    nbHeure: Number,
    image1: String,
    reserved: Boolean,
    id_user_reserved : String,
    is_late : Boolean
});

// Création du modèle basé sur le schéma
const Produit3 = mongoose.model('produit3', produit3Schema);

module.exports = Produit3;