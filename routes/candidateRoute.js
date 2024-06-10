const express = require('express');
const router = express.Router();
const candidate = require('../models/candidate');
const user = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('../jwt');

const checkAdminRole = async (userID) => {
    try{
        const User = await user.findById(userID);
        return (User.role === 'admin');
    }catch(err){
        return false;
    }
}

//post route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try{
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: "You are not admin. Permission denied."});
        }
        const data = req.body;
        const newCandidate = new candidate(data);
        const response = await newCandidate.save();
        res.status(200).json({ message: "candidate added successfully",response });
    }catch(err){
        console.log(err);
        res.status(500).json({"error": err})
    }
});


//Route to update candidate data
router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try{
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: "You are not admin. Permission denied."});
        }
        const candidateId = req.params.candidateId;
        const updatedCandidateData = req.body;
        const response = await candidate.findByIdAndUpdate(candidateId, updatedCandidateData,{
            new: true, //return the updated document
            runValidators: true //run mongoose validation
        });

        if(!response){
            return res.status(404).json({ error: "candidate not found for this ID" });
        }
        res.status(200).json({ message: "candidate updated successfully",response });
    }catch(err){
        console.log(err);
        res.status(500).json({"error": err})
    } 
});


//Route to delete candidate data
router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try{
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: "You are not admin. Permission denied."});
        }
        const candidateId = req.params.candidateId;

        const response = await candidate.findByIdAndDelete(candidateId);

        if(!response){
            return res.status(404).json({ error: "candidate not found for this ID" });
        }
        res.status(200).json({ message: "candidate deleted successfully",response });
    }catch(err){
        console.log(err);
        res.status(500).json({"error": err})
    } 
});


//Route to vote for a candidate
//admin cannot vote & only one vote per user is allowed
router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try{
        const candidateId = req.params.candidateId;
        const userId = req.user.id;

        //checking voting conditions for user
        const userData = await user.findById(userId);
        if( userData.role==='admin' ){
            return res.status(403).json({ error: "Voting is not allowed for admin" });
        }
        if (userData.hasVoted){
            return res.status(400).json({ error: "You have already voted" });
        }

        const candidateData = await candidate.findById(candidateId);
        if(!candidateData){
            return res.status(404).json({ error: "Candidate not found" });
        }

        //updating data for candidate
        candidateData.votes.push({ user: userData.id });
        candidateData.voteCount += 1;
        const response = await candidateData.save(); 
        
        //updating for user
        userData.hasVoted = true;
        response = await userData.save(); 

        res.status(200).json({ message: "Voted successfully", response});
    }catch(err){
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


//Route to count vote
router.get('/vote/count', async (req, res) => {
    try{
        const candidates = await candidate.find().sort({ voteCount: 'desc' });
        const voteRecord = candidates.map((data) => {
            return{
                party: data.party,
                count: data.voteCount
            }
        })
        res.status(200).json(voteRecord);

    }catch(err){
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

//list of candidates
router.get('/', async (req, res) => {
    try{
        const data = await candidate.find();
        res.status(200).json(data);
    }catch(err){
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }

})

module.exports = router;