const mongoose = require('mongoose');
const temperatureSchema = new mongoose.Schema({
    values: [{
        value: {
            type: Number,
            required: true
        }
    }],
    times: [{
        time: {
            type: Number,
            required: true
        }
    }]
},{timestamps: true},{collection: 'temperature'}
)

temperatureSchema.methods.generateValueandTime = async function(value, time) {
    // Generate an auth token for the user
    const temp = this
    temp.values = temp.values.concat({value})
    temp.times = temp.times.concat({time})
    await temp.save()
    return {value, time}
}

const temperatureSchemaModel = mongoose.model('temperature', temperatureSchema);
module.exports = temperatureSchemaModel;