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

setInterval(async ()=>{
    try{
        const machines3 = await Produit3.find();

        for(var machine of machines3){
            if(machine.reserved == true && machine.is_late == false){
                if( (machine.pret + machine.nbHeure - Date.now()) < 0){
                    machine.is_late = true
                }
            }
            machine.save()
        }

        const machines2 = await Produit2.find();

        for(var machine of machines2){
            if(machine.reserved == true && machine.is_late == false){
                if( (machine.pret + machine.nbJour - Date.now()) < 0){
                    machine.is_late = true
                }
            }
            machine.save()
        }

    }catch(error){
        console.log(error)
    }
    
},60000)

app.get("/adminpanel", async(req,res)=>{

    const emprunts = []
    const machines3 = await Produit3.find();
    for(element of machines3){
        if(element.reserved==true){
            emprunts.push({
                "id":element.numberId,
                "nom":element.name,
                "date":element.pret + element.nbHeure,
                "islate":element.is_late
            })
        }
    }
    const machines2 = await Produit2.find();
    for(element of machines2){
        if(element.reserved==true){
            let d = (element.pret + element.nbJour)
            let f = d.substring(0,d.search("GMT")) 
            emprunts.push({
                "id":element.numberId,
                "nom":element.name,
                "date":f,
                "islate":element.is_late
            })
        }
    }
    const data = {
        "data":emprunts
    }
    res.send(JSON.stringify(data))

 
  
})

app.get('/reservation/rendre/:id', async(req,res) =>{
    try{
        const idequipement= req.params.id
        console.log(idequipement)

        const type = parseInt(idequipement.substring(0,1))
        console.log(type)

        res.send("ok");
        switch(type){
            case 3:
                const machines3 = await Produit3.find();
                var machine3;
                for(element of machines3){
                    if(element.numberId==idequipement){
                        machine3 = element
                    }
                }
                machine3.id_user_reserved = ""
                machine3.reserved = false
                machine3.pret = null
                machine3.nbHeure = null
                machine3.save();
                break;
            case 2:
                const machines2 = await Produit2.find();
                var machine2;
                for(element of machines2){
                    if(element.numberId==idequipement){
                        machine2 = element
                    }
                }
                console.log(machine2)
                machine2.id_user_reserved = ''
                machine2.reserved = false
                machine2.pret = null
                machine2.nbJour = null
                machine2.save();
                break;
        }


      

        
        
    


    }catch (error){
        console.log(error)
    }
})

app.post('/reservation', async(req,res) =>{
    
    try{
        const iduser = req.body.iduser
        const idequipement=  req.body.idequipement
        const duree = req.body.duree
        const type = req.body.type

                console.log(`${iduser}, ${idequipement}, ${duree}, ${type}`)
        const machines2 = await Produit2.find();
        const machines3 = await Produit3.find();
        const machines1 = await Produit1.find();
        console.log(machines2)

        const users = await User.find()
        var current_user;
        for(element of users){
            if(element.numberId == iduser){
                current_user = element;
            }
        }

       
        switch(parseInt(type)){
            case 3:
                var machine3;
                for(element of machines3){
                    if(element.numberId==idequipement){
                        machine3 = element
                    }
                }
                console.log(machine3)
                machine3.id_user_reserved = iduser
                machine3.reserved = true
                machine3.pret = Date.now()
                machine3.nbHeure = duree
                machine3.save();

                current_user.historic.push(machine3)


                break;
            case 2:
                var machine2;
                for(element of machines2){
                    if(element.numberId==idequipement){
                        machine2 = element
                    }
                }
                console.log(machine2)
                machine2.id_user_reserved = iduser
                machine2.reserved = true
                machine2.pret = Date.now()
                machine2.nbJour = duree
                machine2.save();
                current_user.historic.push(machine2)
                break;
            case 1:
                var machine1;
                for(element of machines1){
                    if(element.numberId==idequipement){
                        machine1 = element
                    }
                }
                console.log(machine1)
                machine1.quantity -= parseInt(duree)
                machine1.save();
                current_user.historic.push(machine1)
                break;

        }


      current_user.save()

        
        
    


    }catch (error){
        console.log(error)
    }
});


app.get('/reservation/:id', async(req,res)=>{
    try{
        const id = req.params.id;
        console.log(id);
        const type = parseInt(id.substring(0,1))
        if(type != 1){
            res.status(500).send('Pas le bon truc frangin');
        }
        else{
            const machines1 = await Produit1.find();
            var machine1;
            for(element of machines1){
                if(element.numberId==id){
                    machine1 = element
                }
            }
            console.log(machine1)
            res.send(machine1.quantity)
        }
    }catch{
        console.log("error");
    }
})

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
            historic: user.historic,
            mdp: password
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
            mdp: password,
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
        const imageURL = req.body.image1; // Récupérez le nom du fichier téléchargé
        console.log(imageURL);
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


app.post('/stock/register2',async (req, res) => {
    const name = req.body.name;
    const pret = req.body.pret;
    const nbJour = req.body.nbJour;
    const produitId = uuidv4(); // Générer un identifiant unique pour le produit
    const imagePath = req.body.image; // Récupérez le nom du fichier téléchargé
    console.log("Image: "+imagePath);
    const number = await Produit2.find();
    // Créer un nouvel utilisateur
    const newProduit2 = new Produit2({
        numberId: "2" + produitId,
        name,
        pret,
        nbJour,
        image1: imagePath,
        reserved: false,
        id_user_reserved : '',
        is_late:false
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

app.get('/stock/getAllProduit1', async (req, res) => {
    try {
        // Récupérer tous les produits de type Produit1 depuis la base de données
        const produits1 = await Produit1.find();

        // Renvoyer la liste des produits en tant que réponse JSON
        res.json({ produits1 });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des produits.');
    }
});

app.get('/stock/getAllProduit2', async (req, res) => {
    try {
        // Récupérer tous les produits de type Produit1 depuis la base de données
        const produits2 = await Produit2.find();

        // Renvoyer la liste des produits en tant que réponse JSON
        res.json({ produits2 });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des produits.');
    }
});

app.get('/stock/getAllProduit3', async (req, res) => {
    try {
        // Récupérer tous les produits de type Produit1 depuis la base de données
        const produits3 = await Produit3.find();

        // Renvoyer la liste des produits en tant que réponse JSON
        res.json({ produits3 });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des produits.');
    }
});

app.post('/stock/register3', async (req, res) => {
    const name = req.body.name;
    const pret = req.body.pret;
    const nbHeure = req.body.nbHeure;
    const produitId = uuidv4(); // Générer un identifiant unique pour le produit
    const imagePath = req.body.image; // Récupérez le nom du fichier téléchargé
    // Créer un nouvel utilisateur
    const newProduit3 = new Produit3({
        numberId: "3" + produitId,
        name,
        pret,
        nbHeure,
        image1: imagePath,
        reserved: false,
        id_user_reserved : '',
        is_late:false
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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/stock/modif1', async (req, res) => {
    try {
        const name = req.body.name;
        const quantity = req.body.quantity;
        let imageURL = req.body.image1;
        const productId = req.body.productId; // Identifiant unique du produit à mettre à jour
        console.log('salut');
        console.log(productId);

        // Vérifiez d'abord si le produit avec l'identifiant existe

        const existingProduct = await Produit1.findOne({ numberId: productId });
        console.log(existingProduct.name);
        if (!existingProduct) {//on vérifie si le produit existe
            return res.status(404).send('Produit non trouvé.');
        }
        const existingProduct2 = await Produit1.findOne({ name });

        if (existingProduct2 && existingProduct.name != name) {//On vérifie si le nom existe déjà
            return res.status(400).send('Un produit avec le même nom existe déjà.');
        }
        if(imageURL == ''){
            imageURL = existingProduct.image1;
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

app.get('/stock/getAllProduit1', async (req, res) => {
    try {
        // Récupérer tous les produits de type Produit1 depuis la base de données
        const produits1 = await Produit1.find();

        // Renvoyer la liste des produits en tant que réponse JSON
        res.json({ produits1 });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des produits.');
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
            res.send(`${existingUser.firstName} ${existingUser.lastName}`);
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