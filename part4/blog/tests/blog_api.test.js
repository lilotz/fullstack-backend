const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

after(async () => {
  await mongoose.connection.close()
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, 6)
})

test('unique identifier is named id', async () => {
  const response = await api.get('/api/blogs')

  const blog = response.body[0]

  assert.deepStrictEqual(typeof blog._id, 'undefined')
  assert.deepStrictEqual(typeof blog.id, 'string')
})

test('new blog has been added correctly', async () => {
  const response = await api.get('/api/blogs')
  const oldLength = response.body.length

  const newBlog = {
    title: 'React patterns 2',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  }

  await api.post('/api/blogs')
    .send(newBlog)
    .expect(201)

  const allBlogs = await helper.blogsInDb()

  assert.deepStrictEqual(oldLength + 1, allBlogs.length)

  const titles = allBlogs.map(blog => blog.title)

  assert(titles.includes('React patterns 2'))
})

test('new blog has no information about likes', async () => {
  const response = await api.get('/api/blogs')
  const oldLength = response.body.length

  const newBlog = {
    title: 'React patterns 2',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    __v: 0
  }

  await api.post('/api/blogs')
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
    .send(newBlog)
    .expect(400)
})