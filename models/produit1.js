const mongoose = require('mongoose');

// Définition du schéma pour la collection "person"
const produit1Schema = new mongoose.Schema({
    numberId: String,
    quantity: String,
    name: String,
    image1: String
});

// Création du modèle basé sur le schéma
const Produit1 = mongoose.model('produit1', produit1Schema);

module.exports = Produit1;