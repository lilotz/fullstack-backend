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

module.exports = {
  dummy,
  totalLikes,
  favoritePost
}