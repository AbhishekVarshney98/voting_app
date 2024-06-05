const express = require('express');
const router = express.Router();
const candidate = require('../models/candidate');

router.get('/', async (req, res) => {
    try{
        const data = await candidate.find();
        res.status(200).json(data);
    }catch(err){
        console.log(err);
        res.status(500).json({"error": err})
    }
})

module.exports = router;