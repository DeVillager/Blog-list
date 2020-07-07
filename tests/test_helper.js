const Blog = require('../models/blog')

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

module.exports = {
  initialBlogs, nonExistingId, blogsInDB
}