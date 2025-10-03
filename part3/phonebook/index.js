require('dotenv').config()

const mongoose = require('mongoose')
const express = require('express')
const Entry = require('./models/entry')
const morgan = require('morgan')
const app = express()

app.use(express.json())

morgan.token('body', (request) =>
    request.method === 'POST' || request.method === 'PUT'
        ? JSON.stringify(request.body)
        : ''
)

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(express.static('dist'))

app.get('/api/persons', (request, response) => {
    Entry.find({}).then(entries => {
        response.json(entries)
    })
})

/*app.get('/info', (request, response) => {
    const number 
    const = time = new Date()
    response.send(`
        <p>Phonebook has info for ${number} people</p>
        <p>${time}</p>
        `)
})*/

app.get('/api/persons/:id', (request, response) => {
    Entry.findById(request.params.id).then((entry) => {
        response.json(entry)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    Entry.findById(request.params.id).then(entry => {
        response.json(entry)
    })
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    /*const names = entries.map(person => person.name)

    if (names.some(name => name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }*/

    const entry = new Entry({
        name: body.name,
        number: body.number
    })

    entry.save().then(savedEntry => {
        response.json(savedEntry)
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})