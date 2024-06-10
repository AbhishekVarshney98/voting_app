const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const userRoute = require('./routes/userRoute');
const candidateRoute = require('./routes/candidateRoute');

const app = express();

const PORT = process.env.PORT || 3000;
//middlewares
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.status(200).json({ message: "Welcome to the Voting App" });
});

//Routes
app.use('/user',userRoute);
app.use('/candidate', candidateRoute);

//Server listening on PORT
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})