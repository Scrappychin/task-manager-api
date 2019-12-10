//using mongoose now to simplify
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')


//making the schema first so that we can use middleware to has the password before it is sent to the database
//updated this to include timestamps as a last field
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        //email is the unique key, has to be unique, cant have more than one email
        unique: true,
        required: true,
        //trim gets rid of any spaces
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        //default 0 means if no age is added then it just adds as 0
        default: 0,
        validate(value){
            if(value<0){
                throw new Error('Age must be an actual number')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('This is an invalid password, can\'t contain password')
            }
        }
    },
    //putting this token field in for a user so that the token is unique to that user and changes when they log out
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},{
    timestamps: true
})

//this is a 'virtual property' it is a relationship between two things. in this case users and tasks. We don't want to double store every task against each user, we want to link them
userSchema.virtual('tasks', {
    //you reference the model you are linking to (like how Task ref to User)
    ref: 'Task',
    //local field is users ID which is related to task owner field (also user ID)
    localField: '_id',
    foreignField: 'owner'
})



//static methods are accessible on the model, methods are accessible on the instance
userSchema.methods.generateAuthToken = async function (){
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    //adding the token to the users array and resaving the user
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

//non static method again because we are accessing the instance, not the model
//this method makes sure we never send any tokens or password back as JSON
userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()
    //Remove the user password and token in the info we send back
    delete userObject.password
    delete userObject.tokens

    return userObject
}


userSchema.statics.findByCredentials = async (email, password) => {
    //first find the person by email, looking for email = email. Remember that you don't have to write email: email if they have the same name
    const loggedUser = await User.findOne({email})

    if (!loggedUser){
        throw new Error('cant find this login')
    }

    const isMatch = await bcrypt.compare(password, loggedUser.password)
    if(!isMatch){
        throw new Error('Incorrect login')
    }
    return loggedUser
}



//not using an arrow function here because arrow functions don't bind 'this'. This is to hash the plain text password before saving.
userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }

    next()
})

//delete user tasks when user is removed (could do this within the router, but it is better practice to do it as middleware in case there is another method to delete a user later)
userSchema.pre('remove',async function(next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})


//its really imporant to create a separate schema first and then pass it into the model. If instead we were passing an object instead of 'userschema' then we couldnt use middleware
const User = mongoose.model('User', userSchema)

module.exports = User