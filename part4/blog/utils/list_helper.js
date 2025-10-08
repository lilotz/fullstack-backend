const _ = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  const likes = blogs.map(blog => blog.likes)
  const reducer = (total, likes) => {
    return total + likes
  }

  return likes.reduce(reducer, 0)
}

const favoritePost = (blogs) => {
  const likes = blogs.map(blog => blog.likes)
  const max = Math.max(...likes)
  const favorite = blogs.find(blog => blog.likes === max)

  return favorite.author
}

const mostBlogs = (blogs) => {
  const names = _.countBy(blogs, 'author')
  const topAuthor = _.maxBy(Object.keys(names), author => names[author] )

  return{
    author: topAuthor,
    blogs: names[topAuthor]
  }
}

const mostLikes = (blogs) => {
  const likes = blogs.map(blog => blog.likes)
  const mostLikes = Math.max(...likes)
  const topAuthor = _.find(blogs, function(o) {return o.likes === mostLikes})

  return{
    author: topAuthor.author,
    likes: mostLikes
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoritePost,
  mostBlogs,
  mostLikes
}