const express = require('express');
const router = express.Router();
const user = require('../models/user');

router.get('/', async (req, res) => {
    try{
        const data = await user.find();
        res.status(200).json(data);
    }catch(err){
        console.log(err);
        res.status(500).json({"error": err})
    }
})

module.exports = router;