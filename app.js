const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


require("dotenv").config()
const db = require('./helpers/config').CONNECTION_STRING;

app = express();
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;
// console.log(process.env.JWT_KEY)

mongoose
    .connect(db, { useFindAndModify: false })
    .then(() =>{
        console.log("Database is connect");
    })
    .catch(err =>{
        console.log('Error: ', err.message);
    });

var UserRouter = require('./controllers/UserRoute')
var DataRouter = require('./controllers/DataRoute')
app.use('/api/users', UserRouter);
app.use('/api/datas', DataRouter);


app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})