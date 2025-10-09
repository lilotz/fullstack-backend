const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (blog) {
    response.json(blog)
  }
  else {
    response.status(404).end()
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const { author, title, url, likes } = request.body

  const blog = await Blog.findById(request.params.id)


  blog.author = author
  blog.title = title
  blog.url = url
  blog.likes = likes

  const updatedBlog = await blog.save()
  response.status(203).json(updatedBlog)
})

module.exports = blogsRouter