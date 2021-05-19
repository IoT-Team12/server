const mqtt = require('mqtt');
const Light = require('../../models/Light');
const Humidity = require('../../models/Humidity');
const Temperature = require('../../models/Temperature');

class MqttHandler {
  constructor() {
    this.mqttClient = null;
    this.host = 'mqtt://broker.hivemq.com:1883';
    this.subtopic = '/iot2021/pub'
    this.pubtopic = '/iot2021/sub'
  }
  
  connect() {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    this.mqttClient = mqtt.connect(this.host);

    // Mqtt error calback
    this.mqttClient.on('error', (err) => {
      console.log(err);
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on('connect', () => {
      console.log(`mqtt client connected`);
    });

    // mqtt subscriptions
    this.mqttClient.subscribe(this.pubtopic, {qos: 0});

    // When a message arrives, console.log it
    this.mqttClient.on('message', async (pubtopic, message) => {
    //   console.log(message.toString());
    //   var data = JSON.stringify(message.toString())
        var newdata = JSON.parse(message)
        var light ={
            id: newdata.id,
            status: newdata.status
        };
        Light.findOneAndUpdate({id: newdata.id}, light, {upsert: true}, function(err, doc) {
            if (err) console.log(err)
        });
        
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

    this.mqttClient.on('close', () => {
      console.log(`mqtt client disconnected`);
    });
  }

  // Sends a mqtt message to topic: subtopic
  sendMessage(message) {
    this.mqttClient.publish(this.subtopic, JSON.stringify(message));
  }
}

module.exports = MqttHandler;