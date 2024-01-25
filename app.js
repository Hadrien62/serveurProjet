const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const net = require('net');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const multer = require('multer');
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
//const uri = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.1';
const url = 'mongodb://192.168.184.165:27017/FunLab';
mongoose.connect(url)

// Importer le modèle User
const User = require('./models/user');
// Importer le modèle User
const Produit1 = require('./models/produit1');
const Produit2 = require("./models/produit2");
const Produit3 = require("./models/produit3");

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

app.get('/:id', async (req, res) => {
    try{
        const id = req.params.id;
        console.log(id);
    }catch{
        console.log("error");
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

app.post('/users/connect', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        // Utilisez bcrypt.compare pour comparer le mot de passe fourni avec le mot de passe haché stocké
        console.log(email);
        console.log(password);
        console.log(user.password);
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Mot de passe incorrect' });
        }
        const userWithoutPassword = {
            admin: user.admin,
            numberId: user.numberId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            historic: user.historic
        };

        res.json({ user: userWithoutPassword });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
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
    const userId = uuidv4();

    try {
        // Vérifier si l'email existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
        }
        // Générer le hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10); // 10 est le nombre de tours de hachage

        // Créer un nouvel utilisateur avec le mot de passe crypté
        const newUser = new User({
            admin: false,
            numberId: "0" + userId,
            firstName,
            lastName,
            email,
            password: hashedPassword, // Utiliser le mot de passe crypté
            historic: []
        });

        // Enregistrer l'utilisateur dans la base de données
        await newUser.save();
        const userWithoutPassword = {
            admin: false,
            numberId: 0+userId,
            firstName: firstName,
            lastName: lastName,
            email: email,
            historic: []
        };
        res.json({ user: userWithoutPassword });
        console.log('Inscription réussie!');
        const users = await User.find();
        console.log('Contenu de la collection User :', users);
        console.log('Contenu de la requête User :', req.body.nom);
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



// Serveur pour le stock ********************************************
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
app.post('/stock/upload', upload.single('image'), (req, res) => {
    const imagePath = req.file.filename;
    res.json({ imagePath });
});
app.post('/stock/register1', async (req, res) => {
    try {
        const name = req.body.name;
        const quantity = req.body.quantity;
        const imageURL = req.body.imageName; // Récupérez le nom du fichier téléchargé

        // Vérifiez si un produit avec le même nom existe déjà
        const existingProduct = await Produit1.findOne({ name });

        if (existingProduct) {
            return res.status(400).send('Un produit avec le même nom existe déjà.');
        }

        const produitId = uuidv4(); // Générer un identifiant unique pour le produit

        // Créer un nouvel objet Produit1 avec l'image
        const newProduit1 = new Produit1({
            numberId: "1" + produitId,
            name,
            quantity,
            image1: imageURL // Attribuez le nom de l'image à l'attribut 'image'
        });

        // Enregistrez le produit dans la base de données
        await newProduit1.save();

        res.send('Ajout réussi!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de l\'inscription.');
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

app.post('/stock/modif1', async (req, res) => {
    try {
        const productId = req.body.productId; // Identifiant unique du produit à mettre à jour
        const name = req.body.name;
        const quantity = req.body.quantity;
        const imageURL = req.body.imageName; // Récupérez le nom du fichier téléchargé

        // Vérifiez d'abord si le produit avec l'identifiant existe

        const existingProduct = await Produit1.findOne({ numberId: productId });

        if (!existingProduct) {//on vérifie si le produit existe
            return res.status(404).send('Produit non trouvé.');
        }
        const existingProduct2 = await Produit1.findOne({ name });

        if (existingProduct2) {//On vérifie si le nom existe déjà
            return res.status(400).send('Un produit avec le même nom existe déjà.');
        }

        // Mettez à jour les champs nécessaires du produit
        existingProduct.name = name;
        existingProduct.quantity = quantity;
        existingProduct.image1 = imageURL;

        // Enregistrez les modifications dans la base de données
        await existingProduct.save();

        res.send('Mise à jour réussie!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la mise à jour.');
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

app.get('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;

        console.log(id);

        const existingUser = await User.findOne({ numberId: id });

        if (existingUser) {
            // Si l'utilisateur est trouvé, renvoyer ses détails
            res.send(`Nom: ${existingUser.firstName}, Prénom: ${existingUser.lastName}`);
        } else {
            // Si l'utilisateur n'est pas trouvé, renvoyer un message approprié
            res.send('Utilisateur non trouvé');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur serveur');
    }
});

const privateKey = fs.readFileSync(path.join(__dirname, 'private-key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'certificate.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };



// Create an HTTPS server
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, '0.0.0.0', () => {  //accpeter tout les ip lol
    console.log(`HTTPS Server is running on port ${port}`);
});