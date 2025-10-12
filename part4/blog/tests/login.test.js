const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('new user is created successfully', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'lilotz',
      name: 'Lisa Lotz',
      password: 'password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
  })

  test('creating a new user with a too short username fails', async () => {
    const newUser = {
      username: 'li',
      name: 'Lisa',
      password: 'password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
  })

  test('creating a new user with a too short password fails', async () => {
    const newUser = {
      username: 'lisa',
      name: 'Lisa',
      password: 'pa'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
  })

  test('creating an user with an already existing username fails', async () => {
    const newUser = {
      username: 'root',
      name: 'Lisa',
      password: 'test123'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
  })
})

after(async () => {
  await mongoose.connection.close()
})