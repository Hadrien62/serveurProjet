const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const { Observable } = require('rxjs');
const fs = require('fs');
const https = require('https');
const { v4: uuidv4 } = require('uuid');

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

app.post('/stock/register1', upload.single('image'), async (req, res) => {
    try {
        const name = req.body.name;
        const quantity = req.body.quantity;
        const imagePath = req.file.filename; // Récupérez le nom du fichier téléchargé
        const produitId = uuidv4(); // Générer un identifiant unique pour le produit

        // Créer un nouvel objet Produit1 avec l'image
        const newProduit1 = new Produit1({
            numberId: "1" + produitId,
            name,
            quantity,
            image: imagePath // Attribuez le nom de l'image à l'attribut 'image'
        });

        // Enregistrez le produit dans la base de données
        await newProduit1.save();

        res.send('Ajout réussi!');
    } catch (error) {
        console.error(error);
        res.send('Erreur lors de l\'inscription.');
    }
});

app.post('/stock/register2', upload.single('image'),async (req, res) => {
    const name = req.body.name;
    const quantity = req.body.quantity;
    const pret = req.body.pret;
    const nbJour = req.body.nbJour;
    const produitId = uuidv4(); // Générer un identifiant unique pour le produit
    const imagePath = req.file.filename; // Récupérez le nom du fichier téléchargé
    const number = await Produit2.find();
    // Créer un nouvel utilisateur
    const newProduit2 = new Produit1({
        numberId: "2" + produitId,
        quantity,
        name,
        pret,
        nbJour,
        image: imagePath
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

app.post('/stock/register3',upload.single('image'), async (req, res) => {
    const name = req.body.name;
    const quantity = req.body.quantity;
    const pret = req.body.pret;
    const nbHeure = req.body.nbHeure;
    const produitId = uuidv4(); // Générer un identifiant unique pour le produit
    const imagePath = req.file.filename; // Récupérez le nom du fichier téléchargé
    // Créer un nouvel utilisateur
    const newProduit3 = new Produit3({
        numberId: "3" + produitId,
        quantity,
        name,
        pret,
        nbHeure,
        image: imagePath
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


const privateKey = fs.readFileSync(path.join(__dirname, 'private-key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'certificate.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };



// Create an HTTPS server
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, '0.0.0.0', () => {  //accpeter tout les ip lol
    console.log(`HTTPS Server is running on port ${port}`);
});