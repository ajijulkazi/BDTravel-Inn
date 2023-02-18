const express = require('express');
const cors = require('cors');
 const mongoose = require('mongoose');
 const bcrypt = require('bcryptjs');
 const jwt = require('jsonwebtoken');
 const User = require('./models/User.js'); 
 
require('dotenv').config();

const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'gdialSKJAKSIIJASHGCSJA';

app.use(express.json());

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
// 9Dy9D3GI2WRAGUX6

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
            jwt.sign({email:userDoc.email, id:userDoc._id}, jwtSecret, {}, (err, token) =>{
                if(err) throw err;
                res.cookie('token', token).json('pass ok');
            });
            
        } else {
            res.json('pass not ok');
        }
        
    } else {
        res.status(422).json('not found');
    }
})


app.listen(4000);