const mongoose = require('mongoose');
require('dotenv').config();

const mongodbURL = process.env.mongodbURL;

mongoose.connect(mongodbURL)
.then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log("Error connecting to db: ",err)
});

const db = mongoose.connection;

module.exports = db;
