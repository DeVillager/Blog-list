var _ = require('lodash');

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        return sum + item.likes
    }
    return blogs.length === 0
        ? 0
        : blogs.reduce(reducer, 0)
}

const favouriteBlog = (blogs) => {
    const reducer = (prevItem, item) => {
        return item.likes > prevItem.likes
            ? item
            : prevItem
    }
    const favourite = blogs.length === 0
        ? {}
        : blogs.reduce(reducer, blogs[0])
    const { __v, _id, url, ...rest } = favourite
    return rest
}

const mostLikes = (blogs) => {
    const blogSumByAuthor = _(blogs)
        .groupBy('author')
        .map((g) =>
            _.mergeWith({}, ...g, (obj, src) =>
                _.isNumber(obj) ? obj + src : obj))
        .value()
    const bestAuthor = _.maxBy(blogSumByAuthor, 'likes')
    const { __v, _id, url, title, ...result } = bestAuthor
    return result
}

const mostBlogs = (blogs) => {
    const result = _.countBy(blogs, 'author')
    let author = ""
    let blogsAmount = 0
    for (const key in result) {
        // console.log(key)
        if (result[key] > blogsAmount) {
            author = key
            blogsAmount = result[key]
        }
    }
    // console.log(author, ' ', blogsAmount)
    const formattedResult =
    {
        author: author,
        blogs: blogsAmount
    }
    return formattedResult
}

module.exports = {
    dummy,
    totalLikes,
    favouriteBlog,
    mostLikes,
    mostBlogs
}