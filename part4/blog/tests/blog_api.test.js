const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const jwt = require('jsonwebtoken')

const api = supertest(app)

let token

describe('when there is initially some notes saved', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'user', passwordHash })

    await user.save()

    const userToken = { username: user.username, id: user._id }
    token = jwt.sign(userToken, process.env.SECRET)

    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)

    assert.strictEqual(response.body.length, 6)
  })

  test('unique identifier is named id', async () => {
    const response = await api.get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)

    const blog = response.body[0]

    assert.deepStrictEqual(typeof blog._id, 'undefined')
    assert.deepStrictEqual(typeof blog.id, 'string')
  })

  test('finding a specific blog', async () => {
    const response = await api.get('/api/blogs/5a422a851b54a676234d17f7')
      .set('Authorization', `Bearer ${token}`)

    const solution = {
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 7,
      id: '5a422a851b54a676234d17f7',
    }
    assert.deepStrictEqual(response.body, solution)
  })

  test('updating an already existing blog', async () => {
    const updatedBlog = {
      title: 'React patterns 3',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 7,
      id: '5a422a851b54a676234d17f7',
    }

    const response = await api.put('/api/blogs/5a422a851b54a676234d17f7')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedBlog)

    assert.deepStrictEqual(updatedBlog, response.body)
  })

  describe('new blog is added', () => {
    test('new blog has been added correctly', async () => {
      const response = await api.get('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
      const oldLength = response.body.length

      const newBlog = {
        title: 'React patterns 2',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7,
        __v: 0
      }

      await api.post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)

      const allBlogs = await helper.blogsInDb()

      assert.deepStrictEqual(oldLength + 1, allBlogs.length)

      const titles = allBlogs.map(blog => blog.title)

      assert(titles.includes('React patterns 2'))
    })
  })

  describe('some information about new blog is missing', () => {
    test('new blog has no information about likes', async () => {
      const response = await api.get('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
      const oldLength = response.body.length

      const newBlog = {
        title: 'React patterns 2',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        __v: 0
      }

      await api.post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)

      const allBlogs = await helper.blogsInDb()

      assert.deepStrictEqual(allBlogs[oldLength].likes, 0)
    })

    test('title is missing', async () => {
      const newBlog = {
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        __v: 0
      }

      await api.post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)
    })

    test('url is missing', async () => {
      const newBlog = {
        title: 'React patterns 2',
        author: 'Michael Chan',
        __v: 0
      }

      await api.post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})