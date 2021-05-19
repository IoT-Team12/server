const mongoose = require('mongoose');
const lightSchema = new mongoose.Schema({
    id: {
        type: Number,
        require: true,
        unique: true
    },
    status: {
        type: Boolean,
        require: true
    }
}, {collection: 'light'})

const lightSchemaModel = mongoose.model('light', lightSchema);
module.exports = lightSchemaModel;
