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

module.exports = {
  dummy,
  totalLikes
}