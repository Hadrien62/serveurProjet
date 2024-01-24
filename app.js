const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const net = require('net');
const { v4: uuidv4 } = require('uuid');

const app = express();
const cors = require('cors'); // Ajout du module cors
const port = 1234;
const fs = require('fs');
const https = require('https');

app.use(cors()); // Ajout du middleware cors
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Configuration de Mongoose
const uri = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.1';
mongoose.connect(uri);

// Importer le modèle User
const User = require('./models/user');

// Routes
app.get('/users/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'registration.html'));
});
app.post('/users/setAdmin', async (req, res) => {
    try {
        const  email  = req.body.email;

        // Rechercher l'utilisateur par son adresse email
        const user = await User.findOne({ email });

        // Si l'utilisateur est trouvé, mettre à jour la propriété admin à true
        if (user) {
            user.admin = true;
            await user.save();
            res.send('L\'utilisateur est maintenant administrateur.');
        } else {
            res.status(404).send('Utilisateur non trouvé.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la mise à jour de l\'utilisateur.');
    }
});

app.post('/users/deleteUser', async (req, res) => {
    try {
        const { email } = req.body;

        // Supprimer l'utilisateur par son adresse email
        const deletedUser = await User.findOneAndDelete({ email });

        // Si l'utilisateur est trouvé et supprimé, renvoyer une réponse appropriée
        if (deletedUser) {
            res.send(`L'utilisateur avec l'adresse email ${email} a été supprimé.`);
        } else {
            res.status(404).send('Utilisateur non trouvé.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression de l\'utilisateur.');
    }
});
app.post('/users/addHistoric', async (req, res) => {
    try {
        const email = req.body.email;
        const historyEntry = req.body.historic;

        // Mettre à jour l'historique de l'utilisateur par son adresse email
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $push: { historic: historyEntry } },
            { new: true }
        );

        // Si l'utilisateur est trouvé et mis à jour, renvoyer une réponse appropriée
        if (updatedUser) {
            res.send(`Historique mis à jour pour l'utilisateur avec l'adresse email ${email}.`);
        } else {
            res.status(404).send('Utilisateur non trouvé.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la mise à jour de l\'historique de l\'utilisateur.');
    }
});

app.post('/users/getHistoric', async (req, res) => {
    try {
        const email = req.body.email;

        // Rechercher l'utilisateur par son adresse email
        const user = await User.findOne({ email });

        // Si l'utilisateur est trouvé, renvoyer son historique
        if (user) {
            const historic = user.historic;
            res.json({ historic });
        } else {
            res.status(404).send('Utilisateur non trouvé.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération de l\'historique de l\'utilisateur.');
    }
});
app.get('/users/getAll', async (req, res) => {
    try {
        // Récupérer tous les utilisateurs de la collection 'users'
        const users = await User.find();

        // Si des utilisateurs sont trouvés, les renvoyer
        if (users.length > 0) {
            res.json({ users });
        } else {
            res.status(404).send('Aucun utilisateur trouvé.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des utilisateurs.');
    }
});
app.get('/users/getUserByEmail', async (req, res) => {
    try {
        const  email  = req.query.email; // Récupérer l'e-mail à partir des paramètres de requête

        if (!email) {
            return res.status(400).json({ error: 'L\'e-mail est requis' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        // Vous pouvez envoyer les détails de l'utilisateur en réponse
        res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/users/register', async (req, res) => {
    const firstName = req.body.prenom;
    const lastName = req.body.nom;
    const email = req.body.email;
    const password = req.body.mdp;
    const number = await User.find();
    const userId = uuidv4();

    // Créer un nouvel utilisateur
    const newUser = new User({
        admin: false,
        numberId: "0" + userId, //A tester si c'est vide!!!!
        firstName,
        lastName,
        email,
        password,
        historic: []
    });
    try {
        // Enregistrer l'utilisateur dans la base de données
        await newUser.save();
        res.send('Inscription réussie!');
        console.log('Inscription réussie!');
        const users = await User.find();
        console.log('Contenu de la collection User :', users);
        console.log('Contenu de la requete User :', req.body.nom);
    } catch (error) {
        console.error(error);
        res.send('Erreur lors de l\'inscription.');
    }
});

app.get('/users/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/', (req, res) => {
    const info = req.query.c;
    console.log('Informations reçues:', info);
    res.send('test');

})

// Gérer la connexion (à implémenter)
app.post('/users/login', (req, res) => {
    // Ajoutez ici la logique pour vérifier les informations de connexion
    // et authentifier l'utilisateur
    res.send('Connexion réussie!');
});

const privateKey = fs.readFileSync(path.join(__dirname, 'private-key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'certificate.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };



// Create an HTTPS server
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, '0.0.0.0', () => {  //accpeter tout les ip lol
    console.log(`HTTPS Server is running on port ${port}`);
});