const mongoose = require('mongoose');
const humiditySchema = new mongoose.Schema({
    values: [{
        _id: false,
        value: {
            type: Number,
            required: true
        }
    }],
    times: [{
        _id: false,
        time: {
            type: Number,
            required: true
        }
        
    }]
},{timestamps: true},{collection: 'humidity'}
)

humiditySchema.methods.generateValueandTime = async function(value, time) {
    // Generate an auth token for the user
    const humi = this
    if(humi.values.length >= 100){
        humi.values = [];
        humi.times = [];
    }
    humi.values = humi.values.concat({value})
    humi.times = humi.times.concat({time})
    await humi.save()
    return {value, time}
}

const humiditySchemaModel = mongoose.model('humidity', humiditySchema);
module.exports = humiditySchemaModel;