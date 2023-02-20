const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('cors');
 const mongoose = require('mongoose');
 const bcrypt = require('bcryptjs');
 const jwt = require('jsonwebtoken');
 const User = require('./models/User.js'); 
 const cookieParser = require('cookie-parser');
 
require('dotenv').config();

const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'gdialSKJAKSIIJASHGCSJA';

app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
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


app.listen(4000);