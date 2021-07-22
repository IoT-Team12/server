const express = require('express');
const router = express.Router();
const mqttHandler = require('./mqtt/mqtt_handler')
const auth = require('./middleware/auth')
const Light = require('../models/Light')
const Humidity = require('../models/Humidity')
const Temperature = require('../models/Temperature')
const User = require('../models/User')
const mqttClient = require('../app')

var mytopic = '/iot2021/pub'

// var mqttClient = new mqttHandler();
// mqttClient.connect();

router.post("/send-mqtt/led/1", auth,  function(req, res) {
    try{
       // console.log(req.body.status)
        mqttClient.sendLed1((req.body.status));
        res.status(201).send(req.body);
    }
    catch(err){
        res.status(400).send(err)
    }
});

router.post("/send-mqtt/led/2", auth, function(req, res) {
    try{
        //console.log(req.body.status)
        mqttClient.sendLed2((req.body.status));
        res.status(201).send(req.body);
    }
    catch(err){
        res.status(400).send(err)
    }
});

router.get("/recv-mqtt/light", async(req, res) => {
    try{
        await Light.find({})
            .then((data) => {
                res.status(200).send(data)
            })
            .catch(err => {
                res.status(401).send(err)
            })
    }
    catch(err){
        res.status(401).send(err)
    }
})

router.get("/recv-mqtt/light/:lightID", async(req, res) => {
    const lid = req.params.lightID
    try{
        await Light.findOne({id: lid})
            .then((data) => {
                res.status(200).send(data)
            })
            .catch(err => {
                res.status(401).send(err)
            })
    }
    catch(err){
        res.status(401).send(err)
    }
})

router.get("/recv-mqtt/humidity", async(req, res) => {
    try{
        await Humidity.findOne({})
            .then((data) => {
                res.status(200).send(data)
            })
            .catch(err => {
                res.status(401).send(err)
            })
    }
    catch(err){
        res.status(401).send(err)
    }
})

router.get("/recv-mqtt/temperature", async(req, res) => {
    try{
        await Temperature.find({})
            .then((data) => {
                res.status(200).send(data)
            })
            .catch(err => {
                res.status(401).send(err)
            })
    }
    catch(err){
        res.status(401).send(err)
    }
})

module.exports = router;