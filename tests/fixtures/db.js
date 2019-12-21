const User = require('../../src/models/user')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const userOneID = new mongoose.Types.ObjectId()

//making a generic dude after database is wiped so we have something to test off in there
const userOne = {
    _id: userOneID,
    name: 'the Dude',
    email: 'theMan@place.com',
    password: 'xxxxyyyy',
    tokens: [{
        token: jwt.sign({ _id: userOneID}, process.env.JWT_SECRET)
    }]
}

//wipe the database before each run so duplicate new users don't make it fail
const setupDatabase = async() =>{
    await User.deleteMany()
    await new User(userOne).save()
}

module.exports = {
    userOneID,
    userOne,
    setupDatabase
}