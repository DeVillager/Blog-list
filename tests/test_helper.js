const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'moro',
    author: 'tommi',
    url: "www.url.fi",
    likes: 9
  },
  {
    title: 'moikkumies kaiken ties',
    author: 'mongo',
    url: "www.mango.fi",
    likes: 5
  },
]

const initialUsers = [
  {
    name: 'tommi',
    username: 'tomppa',
    passwordHash: "123",
    blogs: []
  },
  {
    name: 'miika',
    username: 'nuuskis',
    passwordHash: "789",
    blogs: []
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ author: 'willremovethissoon' })
  await blog.save()
  await blog.remove()
  return blog._id.toString()
}

const blogsInDB = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs, initialUsers, nonExistingId, blogsInDB, usersInDb
}