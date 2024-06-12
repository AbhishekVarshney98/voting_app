const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const bcrypt = require('bcrypt');


//function to create hash for plain text password
const createHash = (plaintext) => {
    const saltRounds = 8;
    const hashedPassword = bcrypt.hash(plaintext, saltRounds);
    return hashedPassword
}

//function to check if admin role exist in user already or not as only one admin is allowed
const checkAdmin = async () => {
    const adminUser = await User.findOne({ role:'admin' });
    console.log(adminUser);
    if (adminUser){
        return true
    }
    return false
}

//signup API
router.post('/signup', async (req, res) => {
    try{
        const data = req.body;
        // console.log(data.password)
        data.password = await createHash(data.password)
        if (data.role==='admin' && await checkAdmin(data)){
            return res.status(403).json({error: "Admin user already exists."});
        }
        // console.log(data.password)
        const newUser = new User(data);
        const response = await newUser.save();
        console.log("new user sign up completed!");

        const payload = {
            id: response.id
        }
        const token = generateToken(payload);

        res.status(200).json({ message: "User added successfully", response, token});
    }catch(err){
        console.log(err)
        res.status(500).json({ error: "Internal Server Error"})
    }
});

//Login Route
router.post('/login', async (req, res) => {
    try{
        const data = req.body;
        const aadharcard = data.aadharcard;
        const password = data.password;
        
        const userData = await User.findOne({ aadharcard });

        if (!userData || !(await bcrypt.compare(password, userData.password)) ) {
            return res.status(401).json({ message: "Invalid Username or password" });
        }
        // if (!userData ){
        //     return res.status(401).json({ message: "Invalid Username" });
        // }
        // if(!(await bcrypt.compare(password, userData.password))){
        //     return res.status(401).json({ message: "Invalid Password" });
        // }

        const payload = {
            id: userData.id
        }
        const token = generateToken(payload);

        res.status(200).json({ message:"Login Successful", response: userData, token });
    }catch(err){
        console.log(err);
        res.status(500).json({"error": err})
    }
});

//profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const data = req.user;
        const userData = await User.findById(data.id);
        console.log(userData)
        res.status(200).json({response: userData})
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal Server error"})
    }

});


//profile route to update password
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try{
        const data = req.user;
        const {currentPassword, newPassword} = req.body;
        if(currentPassword === newPassword){
            return res.status(401).json({message: "Please enter a new password"})
        }
        const userData = await User.findById(data.id);
        console.log(userData);
        const comparePassword = await bcrypt.compare(currentPassword, userData.password);
        if(!comparePassword){
            return res.status(500).json({error: "Invalid Current Password"});
        }
        userData.password = await createHash(newPassword);
        await userData.save();
        
        
        res.status(200).json({message: "Password Updated"})
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal Server error"})
    }

});

module.exports = router;