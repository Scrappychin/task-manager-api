const supertest = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneID, userOne, setupDatabase } = require('./fixtures/db')

//wipe the database before each run so duplicate new users don't make it fail
beforeEach(setupDatabase)

// test('Should signup a new user', async()=>{
//     const response = await supertest(app).post('/users').send({
//         name:'Mr Mungus',
//         email:'shmeeb@shmeebs.com',
//         password: 'xxxxyyyy'
//     }).expect(201)

//     //assert that the database was changed correctly
//     const user = await User.findById(response.body.user._id)
//     expect(user).not.toBeNull()

//     //assertions about the response
//     expect(response.body).toMatchObject({
//         user: {
//             name: 'Mr Mungus',
//             email: 'shmeeb@shmeebs.com'
//         },
//         token: user.tokens[0].token
//     })
//     expect(user.password).not.toBe('xxxxyyyy')
// })

test('Should login existing user',async()=>{
    const response = await supertest(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    //make sure token is saved in database
    const user = await User.findById(userOneID)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should fail cos user doesnt exist', async()=>{
    await supertest(app).post('/users/login').send({
        email: "fakeEmail@place.com",
        password: 'xxxxyyyy'
    }).expect(400)
})
//when you have a function with heaps of chaining put the method calls on their own line. I didn't know you could do that
test('Get the users profile', async()=>{
    await supertest(app)
                .get('/users/me')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200)
})

test('make sure the dude fails to get profile if unauthenticated (didnt give a token)', async()=>{
    await supertest(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Delete the dude', async()=>{
    await supertest(app)
                .delete('/users/me')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200)
    //check that there is no user now
    expect(User.findById(userOneID)===null)
})

test('make try to delete the dude when not authenticated with a token', async()=>{
    await supertest(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should update valid user fields', async()=>{
    await supertest(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Penis'
        }).expect(200)
    const user = await User.findById(userOneID)
    expect(user.name).toBe('Penis')
})

test('Should not update invalid user fields', async()=>{
    await supertest(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Penis'
        }).expect(400)
})