const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const { Observable } = require('rxjs');

const app = express();
const port = 1234;
const cors = require('cors'); // Ajout du module cors

app.use(cors()); // Ajout du middleware cors
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.set('view engine', 'ejs');
// Configuration de Mongoose
const uri = 'mongodb+srv://teamfloplab:Xxk2S1BlheTkDbSX@floplab.xxd1scb.mongodb.net';
mongoose.connect(uri);

// Importer le modèle User
const Produit1 = require('./models/produit1');
const Produit2 = require("./models/produit2");
const Produit3 = require("./models/produit3");


// Routes
app.get('/stock/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'registration.html'));
});

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        const filename = path.parse(file.originalname).name.replace(/\s/g, '');
        const extension = path.parse(file.originalname).ext;
        cb(null, `${filename}${extension}`);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
    const imagePath = req.file.filename;
    res.json({ imagePath });
});

app.post('/stock/register1', async (req, res) => {
    const name = req.body.name;
    const quantity = req.body.quantity;
    const image = req.body.image;
    const number = await Produit1.find();
    // Créer un nouvel utilisateur
    const newProduit1 = new Produit1({
        numberId: "1" + toString(number.length),
        name,
        quantity,
        image
    });
    h
    try {
        // Enregistrer l'utilisateur dans la base de données
        await newProduit1.save();
        res.send('Ajout réussi!');
    } catch (error) {
        console.error(error);
        res.send('Erreur lors de l\'inscription.');
    }
});

app.post('/stock/register2', async (req, res) => {
    const name = req.body.name;
    const quantity = req.body.quantity;
    const pret = req.body.pret;
    const nbJour = req.body.nbJour;
    const image = req.body.image;
    const number = await Produit2.find();
    // Créer un nouvel utilisateur
    const newProduit2 = new Produit1({
        numberId: "2" + toString(number.length),
        quantity,
        name,
        pret,
        nbJour,
        image
    });
    try {
        // Enregistrer l'utilisateur dans la base de données
        await newProduit2.save();
        res.send('Ajout réussi!');
    } catch (error) {
        console.error(error);
        res.send('Erreur lors de l\'inscription.');
    }
});

app.post('/stock/register3', async (req, res) => {
    const name = req.body.name;
    const quantity = req.body.quantity;
    const pret = req.body.pret;
    const nbHeure = req.body.nbHeure;
    const image = req.body.image;
    const number = await Produit3.find();
    // Créer un nouvel utilisateur
    const newProduit3 = new Produit3({
        numberId: "3" + toString(number.length),
        quantity,
        name,
        pret,
        nbHeure,
        image
    });
    try {
        // Enregistrer l'utilisateur dans la base de données
        await newProduit3.save();
        res.send('Ajout réussi!');
    } catch (error) {
        console.error(error);
        res.send('Erreur lors de l\'inscription.');
    }
});

app.get('/stock/dispo', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
// Gérer la connexion (à implémenter)
app.post('/stock/dispo', (req, res) => {
    // Ajoutez ici la logique pour vérifier les informations de connexion
    // et authentifier l'utilisateur
    res.send('Stock modifié!');
});

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});