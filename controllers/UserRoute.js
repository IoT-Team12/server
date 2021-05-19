const express = require('express');
const md5 = require('md5')
const router = express.Router();

const User = require('../models/User')
const auth = require('./middleware/auth')

router.post('/signup', async(req, res) => {
    
    try {
        const user = new User(req.body)
        const token = await user.generateAuthToken()
        await user
            .save()
            .then(()=>{
            res.send([user, token])
        })
    } catch (error) {
        res.status(400).send(error)
    }
}) 

router.post('/login', async(req, res) => {
    //Login a registered user
    const {email, password} = req.body;
    const user = await User.findOne({email: email})
    if(!user){
        res.status(400).json({error: 'Invalid email/password'}).end()
    }
    var enpass = md5(password);
    if(enpass == user.password){
        const token = await user.generateAuthToken()
        console.log(token)
        res.status(200).send([user, token])
    }
    else{
        res.status(400).json({error: 'Invalid email/password'}).end()
    }
})

router.get('/me', auth, async(req, res) => {
    try{
        console.log(req.token)
        res.send([req.user, req.token])
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/me/logoutall', auth, async(req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router;