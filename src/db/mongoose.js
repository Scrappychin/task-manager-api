const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

// const Task = mongoose.model('Task',{
//     description: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     completed: {
//         type: Boolean,
//         default: false
//     }
// })


// const me = new User({
//     name: 'slimon',
//     email: 'slimaon@gmail.com',
//     age: 18,
//     password: 'jabsbbsbs'
// })

// me.save().then(()=>{
//     console.log(me)
// }).catch((error)=>{
//     console.log('Error', error)
// })

// const firstTask = new Task({
//     description: 'Milk the fish',
//     completed: true
// })

// firstTask.save().then(()=>{
//     console.log(firstTask)
// }).catch((error)=>{
//     console.log('Error', error)
// })