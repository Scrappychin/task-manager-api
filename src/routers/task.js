const express = require('express')
const router =new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/authentication')

router.post('/tasks', auth, async (req, res) => {
    //const task = new Task(req.body)
    const task = new Task({
        //this is an object which was the req.body with the task description and completed status
        ...req.body,
        //here we are hard coding the task owner from the request auth, no need to send the name of the owner when they make a task request
        owner: req.user._id
    })
    try {
        const theTask = await task.save()
        res.status(201).send(theTask)
    }
    catch(e){
        res.status(400).send(e)
    }

    // task.save().then(()=>{
    //     res.status(201).send(task)
    // }).catch((error)=>{
    //     res.status(400).send(error)
    // })
})

//get all tasks.. GET /tasks?completed=true
//GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:asc
//remember that the skip must be a multiple of the limit, or it would be weird
router.get('/tasks',auth,async (req,res)=>{
    //a good way to set your query to accept junk from the URL is to set an object at the start (in this case named match) and update it according to the URL commands
    //populate can accept just a string, or it can take an object with the match command as well
    const match = {}
    const sort = {}
    if(req.query.completed){
        //this looks weird, but what is happening is you can't just take the string true and say it is true, true is just a string in the url, so this is
        //making match.completed equal to the fact that req.query.completed equals the string true (if true then it returns true, if not true then false)
        //this is good cos it allows no completed status to display all tasks if it is not set
    
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        //this is a ternary operator, a bit nicer than a nested if here to add 1 or -1 to signify sort desc or asc in the options field. it asks if it is desc, if desc it is set as -1, else 1
        //with this I assume it defaults as asc if no value is given
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try{
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(200).send(req.user.tasks)
    }
    catch(e){
        res.status(500).send()
    }


    // Task.find({}).then((tasks)=>{
    //     res.send(tasks)
    // }).catch((e)=>{
    //     res.status(500).send()
    // })
})
//Remember that the name of the thing is anything after :, that takes the whole string in the URL after the / as the content of the thing you named. You gotta underscore it for some reason
router.get('/tasks/:id',auth,async (req,res)=>{
    const _id = req.params.id
    try{
        //here can only find the task if it is one that the dude has created
        const task = await Task.findOne({ _id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task) //I don't think you ever need to explicitly send a 200 code as success, but I did it above anyway
    }
    catch(e){
        res.status(500).send()
    }

    // Task.findById(_id).then((task)=>{
    //     if(!task){
    //         return res.status(404).send()
    //     }
    //     res.send(task)
    // }).catch((e)=>{
    //     res.status(500).send()
    // })
})

router.delete('/tasks/:id',auth,async (req,res) =>{
    try{
        const deletedTask = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!deletedTask){
            return res.status(404).send()
        }
        res.send(deletedTask)
    }
    catch(e){
        res.status(500).send(e)
    }
})


router.patch('/tasks/:id',auth, async(req,res)=>{
    //here trying to set up an error if they send something which does not exist in the database
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try{      
        const updatedTask = await Task.findOne( {_id: req.params.id, owner: req.user._id})
        
        if(!updatedTask){
            return res.status(404).send()
        }
        //can't use the little dots here to explicitly say what we are referring to because we don't know what value they are updating, instead you can just use fancy brackets to be variable
        updates.forEach((update)=>updatedTask[update] = req.body[update])
        await updatedTask.save()
        res.send(updatedTask)
    }
    catch(e){
        res.status(400).send(e)
    }
})

module.exports = router