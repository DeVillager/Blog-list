const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')


beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})


describe('when initial blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned (4.8)', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('verify that blog post has id property (4.9)', async () => {
    const response = await api.get('/api/blogs')
    const firstBlog = response.body[0]
    expect(firstBlog.id).toBeDefined()
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)
    expect(titles).toContain('moikkumies kaiken ties')
  })

  test('the first blog title is moro', async () => {
    const response = await api.get('/api/blogs')
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
      likes: 42
    }

    await api
      .post('/api/blogs')
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
      .send(newBlog)
      .expect(400)
  })
})


describe('when viewing specific blog', () => {
  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDB()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(blogToView)
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
      .expect(204)

    const blogsAtEnd = await helper.blogsInDB()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('when updating blog (4.14)', () => {
  test('likes can be updated', async () => {
    const blogsAtStart = await helper.blogsInDB()
    const blogToUpdate = blogsAtStart[0]
    const newLikes = 123456
    const newBlog = {...blogToUpdate, likes: newLikes}

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
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
    const newBlog = {...blogToUpdate, likes: 100}

    await api
      .put(`/api/blogs/unknownPath`)
      .send(newBlog)
      .expect(400)
  })
})


afterAll(() => {
  mongoose.connection.close()
})