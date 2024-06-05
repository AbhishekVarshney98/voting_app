const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    party: {
        type: String,
        required: true
    },
    
});

const candidate = mongoose.model('candidate',candidateSchema);

module.exports = candidate;