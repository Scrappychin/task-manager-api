const express = require('express')
const router =new express.Router()
const User = require('../models/user')
const auth = require('../middleware/authentication')
const { sendWelcomeEmail } = require('../emails/account')
const { sendCancellationEmail } = require('../emails/account')
//here we are asking for the http POST of users (important to note it is a post, not a GET). Postman can send this through in absence of a real site
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    
    //old code without async await
    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((error)=>{
    //     //chaining a status in before the error to make sure the 400 status code goes through instead of a 200
    //     res.status(400).send(error)
    // })
    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    }catch (e) {
        res.status(400).send(e)
    }
})

//validating the login. The dude says its better to make a reusable function for this, we made findbycredentials. I would have whacked the bcrypt in here. Whatever
router.post('/users/login', async (req,res) =>{
    try{
        const loggedUser = await User.findByCredentials(req.body.email,req.body.password)
        //generateAuthToken also a bespoke method
        const token = await loggedUser.generateAuthToken()
        //now we send back the logged users details as well as an authentication tokent from the generateAuthToken method in the user.js in models
        res.send({loggedUser, token})
    }
    catch(e){
        //not sending back the e for password errors on purpose
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !==req.token  
        })
        await req.user.save()
        res.send()
    }
    catch(e){
        res.status(500).send(e)    
    }
})

router.post('/users/logoutAll', auth, async (req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()
    }
    catch(e){
        res.status(500).send(e)    
    }
})



//auth function running before the get users function
router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user)
})
//if you want to get whatever they sent in the HTTP request you do : then the name of the thing that it will be (i.e. the variable name you want to use in your function)
    //remember that if there is no user it will still be a success, gotta add code for that
    //nb mongoose automatically converts object ids into string ids so dont have to do the thing like with mongodb

router.patch('/users/me', auth, async(req,res)=>{
    //here trying to set up an error if they send something which does not exist in the database
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try{
        //word on the street is the findbyid method bypasses mongoose, which means that middleware also doesnt work (dangerous for passwords), gotta use the mongoose way instead
        // const updatedUser = await User.findByIdAndUpdate(req.params.id,req.body,{ new: true, runValidators: true})
        //instead
        const updatedUser = req.user
        //can't use the little dots here to explicitly say what we are referring to because we don't know what value they are updating, instead you can just use fancy brackets to be variable
        updates.forEach((update)=>updatedUser[update] = req.body[update])

        await updatedUser.save()
        //no longer need the below with the new model cos the user definitely exists cos it was authenticated
        // if(!updatedUser){
        //     return res.status(404).send()
        // }
        res.send(updatedUser)
    }
    catch(e){
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req,res) =>{
    try{
        // //you can find out which user it is here because of the auth function identifying the user by the token
        // const deletedUser = await User.findByIdAndDelete(req.user._id)
        // if(!deletedUser){
        //     return res.status(404).send()
        // }
        sendCancellationEmail(req.user.email, req.user.name)
        await req.user.remove()
        res.send(req.user)
    }
    catch(e){
        res.status(500).send(e)
    }
})

router.delete('/users/me', auth, async (req,res) =>{
    try{
        // //you can find out which user it is here because of the auth function identifying the user by the token
        // const deletedUser = await User.findByIdAndDelete(req.user._id)
        // if(!deletedUser){
        //     return res.status(404).send()
        // }
        sendCancellationEmail(req.user.email, req.user.name)
        await req.user.remove()
        res.send(req.user)
    }
    catch(e){
        res.status(500).send(e)
    }
})

module.exports = router