const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}
const password = process.argv[2]

const url = `mongodb+srv://lisalotz:${password}@fullstack.glglcyk.mongodb.net/?retryWrites=true&w=majority&appName=fullstack`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const entrySchema = new mongoose.Schema({
  name: String,
  number: Number,
})

const Entry = mongoose.model('Entry', entrySchema)

if (process.argv.length < 4) {

  Entry.find({}).then(result => {
    result.forEach(entry => {
      const name = entry.name
      const number = entry.number
      console.log(`${name} ${number}`)
    })
    mongoose.connection.close()
  })
}

else if (process.argv.length === 5) {

  const entry = new Entry({
    name: process.argv[3],
    number: process.argv[4]
  })

  entry.save().then(() => {
    console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
    mongoose.connection.close()
  })
}

else {
  console.log('not enough arguments were given')
  process.exit(1)
}