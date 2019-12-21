const supertest = require('supertest')
const Task = require('../src/models/task')
const app = require('../src/app')
const { userOneID, userOne, setupDatabase } = require('./fixtures/db')

//wipe the database before each run so duplicate new users don't make it fail
beforeEach(setupDatabase)

test('Should create a task for the user', async ()=>{
    const response = await supertest(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'from the test'
        })
        .expect(201)
        const task = await Task.findById(response.body._id)
        expect(task).not.toBeNull()
        expect(task.completed).toEqual(false)
})