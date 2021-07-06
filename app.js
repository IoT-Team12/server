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
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/img'))
app.set("view engine", "ejs");
app.set("views", "./views");

function strcmp(a, b) {
    if (a.toString() < b.toString()) return -1;
    if (a.toString() > b.toString()) return 1;
    return 0;
}

var port = process.env.PORT || 3000;
var server = require("http").Server(app);
var io = require("socket.io")(server);
// console.log(process.env.JWT_KEY)
mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883');
temperatureTopic = 'group12/dht/temperature'
humidityTopic = 'group12/dht/humidity'
led1Topic = 'group12/led/1'
led2Topic = 'group12/led/2'
led1SubTopic = 'group12/led/1/pub'
led2SubTopic = 'group12/led/2/pub'

mqttClient.on('connect', () => {
    console.log('Mqtt connected.')
    mqttClient.subscribe(temperatureTopic, {qos: 0});
    mqttClient.subscribe(humidityTopic, {qos: 0});
    mqttClient.subscribe(led1Topic, {qos: 0});
    mqttClient.subscribe(led2Topic, {qos: 0});
})

mqttClient.on('offline', () => {
    console.log('Mqtt offline.')
})

mqttClient.on('error', (err) => {
    console.log(err);
    mqttClient.end();
  });

mqttClient.on('message', async function (topic, message) {  
   if(strcmp(topic, led1Topic) == 0){
        // console.log(message.toString())
        // io.sockets.emit('humidity', parsedMessage.humidity);
        // io.sockets.emit('temperature', parsedMessage.temperature);
        var newdata = new Light();
        newdata.id = 1;
        if(strcmp(message, 'off') == 0){
            newdata.status = 'false';
        }
        else if(strcmp(message, 'on') == 0){
            newdata.status = 'true';
        }
        var light ={
            id: newdata.id,
            status: newdata.status
        };
        if(newdata.id!=null && newdata.status!=null){
            Light.findOneAndUpdate({id: newdata.id}, light, {upsert: true}, function(err, doc) {
                if (err) console.log(err)
            });
        }
   }
   if(strcmp(topic, led2Topic) == 0){
        // console.log(message.toString())
        // io.sockets.emit('temperature', parsedMessage.temperature);
        var newdata = new Light();
        newdata.id = 2;
        if(strcmp(message, 'off') == 0){
            newdata.status = 'false';
        }
        else if(strcmp(message, 'on') == 0){
            newdata.status = 'true';
        }
        var light ={
            id: newdata.id,
            status: newdata.status
        };
        if(newdata.id!=null && newdata.status!=null){
            Light.findOneAndUpdate({id: newdata.id}, light, {upsert: true}, function(err, doc) {
                if (err) console.log(err)
            });
        }
    }
    if(strcmp(topic, humidityTopic) == 0){
        // console.log(message.toString())
        const hvalue = parseFloat(message.toString());
        // console.log(hvalue)
        io.sockets.emit('humidity', message.toString());
        const humidity = await Humidity.findOne({})
        if(!humidity){
            var hum = new Humidity(null, null)
            hum.generateValueandTime(hvalue, 0)
        }
        else{
            humidity.generateValueandTime(hvalue, 0)
            // for(var i =0; i<humidity.values.length; i++){
            //     console.log(humidity.values[i].value)
            // }
        }
    }
    if(strcmp(topic, temperatureTopic) == 0){
        // console.log(message.toString())
        const tvalue = parseFloat(message.toString());
        // console.log(tvalue)
        io.sockets.emit('temperature', tvalue);
        const temperature = await Temperature.findOne({})
        if(!temperature){
            var tem = new Temperature(null, null)
            tem.generateValueandTime(tvalue, 0)
        }
        else{
            temperature.generateValueandTime(tvalue, 0);
        }
    }
});

mqttClient.sendLed1 = function sendLed1(message){
    mqttClient.publish(led1Topic, message);
}

mqttClient.sendLed2 = function sendLed2(message){
    mqttClient.publish(led2Topic, message);
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

app.get("", function(req, res){
    res.render("home")
})

app.get("/login", function(req, res){
    res.render("login")
})

app.get("/register", function(req, res){
    res.render("register")
})

