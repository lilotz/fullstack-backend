const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
blogsRouter.get('/', (request, response, next) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs)
  })
    .catch(error => next(error))
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

module.exports = blogsRouter