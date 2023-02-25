const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('cors');
 const mongoose = require('mongoose');
 const bcrypt = require('bcryptjs');
 const jwt = require('jsonwebtoken');
 const Place = require('./models/Place');
 const User = require('./models/User.js'); 
 const cookieParser = require('cookie-parser');
 const imageDownloader = require('image-downloader');
 const multer = require('multer');
 const fs = require('fs');

 
require('dotenv').config();

const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'gdialSKJAKSIIJASHGCSJA';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));
app.use(cors({
    credentials: true,
    origin: 'http://127.0.0.1:5173',
}));

 //console.log(process.env.MONGO_URL);

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL);
 
app.get('/test', (req, res) => {
    res.json('test ok');
});
// 9Dy9D3GI2WRAGUX6 (password)

app.post('/register',async (req, res) =>{
    const {name,email,password} = req.body;
   try {
        const userDoc = await User.create({
        name,
        email,
        password:bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
   } catch (e) {
    res.status(422).json(e);
   }
}); 

app.post('/login', async (req,res) =>{
    const {email, password} = req.body;
    const userDoc = await User.findOne({email});
    if(userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if(passOk) {
            jwt.sign({
                email:userDoc.email, 
                id:userDoc._id
            }, jwtSecret, {}, (err, token) =>{
                    if(err) {
                        throw err;
                    }                            // cookie is set for permanent below ,{sameSite:'none', Secure:true}
                    res.cookie('token', token,{expires: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 365)), sameSite: 'none', secure: true}).json(userDoc);
            });
            
        } else {
            res.status(422).json('pass not ok');
        }
        
    } else {
        res.json('not found');
    }
});

app.get('/profile', (req, res) =>{
    const {token} = req.cookies;
    if(token) {
        jwt.verify(token, jwtSecret, {}, async(err, userData) =>{
            if(err) throw err;
            const {name,email,_id} =  await User.findById(userData.id);
            res.json({name,email,_id});
            
        });
    }else{
        res.json(null);
    }
    
});

// app.get('/logout', (req, res) => {
//     res.clearCookie('token');
//     return res.status(200).redirect('/login');
//   });

app.post('/logout', (req, res) =>{
    // console.log(res.cookie);
    res.cookie('token', '', {sameSite: 'none', secure: true}).json(true);
    //res.clearCookie('token');
    // return res.status(200).redirect('/login');
    // res.cookie('token', '').json(true);
});

app.post('/upload-by-link', async (req, res) => {
    const {link} = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
   await imageDownloader.image({
        url:link,
        dest: __dirname + '/uploads/' +newName,
    });
    res.json(newName);
});

const photoMiddleware = multer({dest:'uploads'});
app.post('/upload',photoMiddleware.array('photos',100), (req, res) =>{
    const uploadedFiles = [];
    for(let i=0; i<req.files.length; i++){
        const {path, originalname} = req.files[i];
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
        uploadedFiles.push(newPath.replace('uploads',''));
    }
    res.json(uploadedFiles);

});

app.post('/places', (req,res) => {
    const {token} = req.cookies;
    const {title, address,addedPhotos,
        description,perks, extraInfo,
        checkIn,checkOut,maxGuests,price,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async(err, userData) =>{
        if(err) throw err;
        const placeDoc =  await Place.create({
            owner:userData.id,
            title, address,photos:addedPhotos,
        description,perks, extraInfo,
        checkIn,checkOut,maxGuests,price,
        });
        res.json(placeDoc);
    });
    
});

app.get('/user-places', (req, res) =>{
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async(err, userData) =>{
        const {id} = userData;
        res.json( await Place.find({owner:id}));
    });
});

app.get('/places/:id', async(req, res) =>{
    const {id} = req.params;
    res.json(await Place.findById(id));
});

app.put('/places', async(req, res) =>{
    const {token} = req.cookies;
    const {
        id,
        title, address,addedPhotos,
        description,perks, extraInfo,
        checkIn,checkOut,maxGuests,price,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async(err, userData) =>{
        if(err) throw err;
        const placeDoc = await Place.findById(id);
        if(userData.id === placeDoc.owner.toString()){
            placeDoc.set({
                title, address,photos:addedPhotos,
                description,perks, extraInfo,
                checkIn,checkOut,maxGuests,price,
            });
            await placeDoc.save();
            res.json('ok');
        }

    });
});


app.get('/places', async(req, res) =>{
    res.json(await Place.find() );
});

app.listen(4000);