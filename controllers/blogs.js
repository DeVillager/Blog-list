const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1, id: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)
  // const user = await User.findOne({})
  console.log('blog added to user: ', user)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.json(savedBlog.toJSON())
})

blogsRouter.get('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog.toJSON())
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  console.log('decoded token id: ', decodedToken.id)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const blog = await Blog.findById(request.params.id)
  console.log('blog user: ', blog)
  if (decodedToken && blog.user.toString() === decodedToken.id.toString()) {
    const res = await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } else {
    response.status(401).end()
  }
  // next(error)
  // response.status(204).end()
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body
  let blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0
  }
  // console.log(blog)
  blog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true, context: 'query' })
  if (blog) {
    response.json(blog.toJSON())
  } else {
    response.status(404).end()
  }
})

module.exports = blogsRouter