const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
let TOKEN = ''

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  for (let user of helper.initialUsers) {
    let userObj = new User(user)
    await userObj.save()
  }

  for (let blog of helper.initialBlogs) {
    let blogObj = new Blog(blog)
    blogObj.user = await User.findOne({})
    await blogObj.save()
  }

  const loggingUser = await User.findOne({})
  console.log('logginguser: ', loggingUser)

  const login = await api
    .post('/api/login')
    .send(loggingUser)

  const userForToken = {
    username: loggingUser.username,
    id: loggingUser.id,
  }

  TOKEN = jwt.sign(userForToken, process.env.SECRET)
  console.log('TOKEN is: ', TOKEN)
})


describe('when initial blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .set('Authorization', 'bearer 12345')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned (4.8)', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', 'bearer 12345')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('verify that blog post has id property (4.9)', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', 'bearer 12345')
    const firstBlog = response.body[0]
    expect(firstBlog.id).toBeDefined()
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', 'bearer 12345')
    const titles = response.body.map(r => r.title)
    expect(titles).toContain('moikkumies kaiken ties')
  })

  test('the first blog title is moro', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', 'bearer 12345')
    // console.log('test response: ', response.body)
    // expect(response.body[0].title).toBe('moro')
    expect(response.body[0].title).toBe('moro')
  })
})

describe('when adding new blogs', () => {
  test('a valid blog can be added (4.10)', async () => {
    const newBlog = {
      title: 'newBlog',
      author: 'Newman',
      url: "www.newblog.fi",
      likes: 42,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', 'bearer ' + TOKEN)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDB()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).toContain('newBlog')
  })

  test('blog without likes will default it to 0 (4.11)', async () => {
    const newBlog = {
      title: 'blog with no likes',
      url: 'www.uninterestingblog.com',
    }

    const sentBlog = await api
      .post('/api/blogs')
      .set('Authorization', 'bearer ' + TOKEN)
      .send(newBlog)
      .expect(200)

    // console.log(sentBlog.body)
    expect(sentBlog.body.likes).toEqual(0)
  })

  test('missing title or url results to error 400 (4.12)', async () => {
    const newBlog = {
      author: 'somebody'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', 'bearer ' + TOKEN)
      .send(newBlog)
      .expect(400)
  })

  test('adding blog fails with error 401 when token is not provided (4.22)', async () => {
    const newBlog = {
      author: 'somebody'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })
})


describe('when viewing specific blog', () => {
  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDB()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .set('Authorization', 'bearer ' + TOKEN)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    console.log('resultBlog: ', resultBlog.body)
    console.log('blogtoview: ', blogToView)
    expect(JSON.stringify(resultBlog.body)).toEqual(JSON.stringify(blogToView))
  })
})


// describe('when there is initially some notes saved', () => {

// })

describe('when deleting blog (4.13)', () => {
  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDB()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', 'bearer ' + TOKEN)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDB()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('when updating blog (4.14)', () => {
  test('likes can be updated', async () => {
    const blogsAtStart = await helper.blogsInDB()
    const blogToUpdate = blogsAtStart[0]
    const newLikes = 123456
    const newBlog = { ...blogToUpdate, likes: newLikes }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', 'bearer ' + TOKEN)
      .send(newBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDB()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    const likes = blogsAtEnd.map(r => r.likes)
    expect(likes).toContain(newLikes)
  })

  test('updating object in unassigned path', async () => {
    const blogsAtStart = await helper.blogsInDB()
    const blogToUpdate = blogsAtStart[0]
    const newBlog = { ...blogToUpdate, likes: 100 }

    await api
      .put(`/api/blogs/unknownPath`)
      .set('Authorization', 'bearer ' + TOKEN)
      .send(newBlog)
      .expect(400)
  })
})


afterAll(() => {
  mongoose.connection.close()
})