const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    mobile: {
        type: String
    },
    email: {
        type: String
    },
    address: {
        type: String,
        required: true
    },
    aadharcard: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    hasVoted: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['voter','admin'],
        default: 'voter'
    }
});

const user = mongoose.model('user',userSchema);

module.exports = user;