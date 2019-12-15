const express = require('express')
//calling require mongoose here just to ensure that the file runs and that mongoose connects to the database
require('./db/mongoose')
//here just grabbing the user model
//const User = require('./models/user')
//const Task = require('./models/task')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')


const app = express()
//have added a dev.env file which is ignored by GIT so the port is decided by the file if local, or by heroku if up online. SMART
const port = process.env.PORT
//here we are setting up a method to do some stuff between the request and route handler (between it going to the server)
//this is a middleware function. Make sure you call next or it will just hang forever whenever you try to handle any routes

// app.use((req,res,next)=>{
//     if(req.method==='GET'){
//         res.send('nah nah nah, no GETS')
//     }else{
//         next()
//     }
// })

app.use(express.json())
//here we start using the user router to send user requests to the router user file instead of everything in index like a lunatic
app.use(userRouter)
app.use(taskRouter)


//using npm env-cmd to make sure this guy will use the correct port depending on the OS of the server where the app is installed
//watch lecture 133 cos you also need to make a small change to the json file to get this to work by telling the dev script to also use env-cmd to open the environment file in config

const Task = require('./models/task')
const User = require('./models/user')

module.exports = app