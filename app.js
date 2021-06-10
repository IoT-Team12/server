const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mqtt = require('mqtt')
const Light = require('./models/Light')
const Humidity = require('./models/Humidity')
const Temperature = require('./models/Temperature')
require("dotenv").config()
const db = require('./helpers/config').CONNECTION_STRING;

app = express();
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", "./views");

var port = process.env.PORT || 3000;
var server = require("http").Server(app);
var io = require("socket.io")(server);
// console.log(process.env.JWT_KEY)
mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883');
subtopic = '/iot2021/pub'
pubtopic = '/iot2021/sub'

mqttClient.on('connect', () => {
    console.log('Mqtt connected.')
    mqttClient.subscribe(pubtopic, {qos: 0});
})

mqttClient.on('offline', () => {
    console.log('Mqtt offline.')
})

mqttClient.on('error', (err) => {
    console.log(err);
    mqttClient.end();
  });

mqttClient.on('message', async function (topic, message) {  
    /* console.log('Received: ' + message.toString() + ' from topic: ' + topic.toString()); */
    let parsedMessage = JSON.parse(message);
    io.sockets.emit('humidity', parsedMessage.humidity);
    io.sockets.emit('temperature', parsedMessage.temperature);
    console.log(parsedMessage)
    var newdata = JSON.parse(message)
    var light ={
        id: newdata.id,
        status: newdata.status
    };
    // console.log(newdata.id)
    // console.log(newdata.status)
    if(newdata.id!=null && newdata.status!=null){
        Light.findOneAndUpdate({id: newdata.id}, light, {upsert: true}, function(err, doc) {
            if (err) console.log(err)
        });
    }
    const humidity = await Humidity.findOne({})
    const hvalue = newdata.humidity
    const time = newdata.time
    if(!humidity){
        var hum = new Humidity(null, null)
        hum.generateValueandTime(hvalue, time)
    }
    else{
        humidity.generateValueandTime(hvalue, time)
        // for(var i =0; i<humidity.values.length; i++){
        //     console.log(humidity.values[i].value)
        // }
    }

    const temperature = await Temperature.findOne({})
    const tvalue = newdata.temperature
    if(!temperature){
        var tem = new Temperature(null, null)
        tem.generateValueandTime(tvalue, time)
    }
    else{
        temperature.generateValueandTime(tvalue, time)
    }
});

mqttClient.sendMessage = function sendMessage(message){
    mqttClient.publish(subtopic, JSON.stringify(message));
}

module.exports = mqttClient;

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

server.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})

io.on("connection", function(socket){
    console.log("co nguoi ket noi: ", socket.id);
    // io.sockets.emit('Alldata', "parsedMessage");
})

app.get("/", function(req, res){
    res.render("home")
})


