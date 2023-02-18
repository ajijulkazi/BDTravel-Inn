const express = require('express');
const cors = require('cors');
 const mongoose = require('mongoose');
require('dotenv').config();

const app = express();


app.use(express.json());

app.use(cors({
    credentials: true,
    origin: 'http://127.0.0.1:5173',
}));

// console.log(process.env.MONGO_URL);

 mongoose.set('strictQuery', true);
 mongoose.connect("mongodb+srv://booking:9Dy9D3GI2WRAGUX6@cluster0.tfzqfua.mongodb.net/?retryWrites=true&w=majority");
 
app.get('/test', (req, res) => {
    res.json('test ok');
});
// 9Dy9D3GI2WRAGUX6

app.post('/register', (req, res) =>{
    const {name,email,password} = req.body;
    res.json({name,email,password});
}); 


app.listen(3001);