require('dotenv').config()

const mongoose = require('mongoose')
const express = require('express')
const Entry = require('./models/entry')
const morgan = require('morgan')
const app = express()

app.use(express.static('dist'))
app.use(express.json())

morgan.token('body', (request) =>
    request.method === 'POST' || request.method === 'PUT'
        ? JSON.stringify(request.body)
        : ''
)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response, next) => {
    Entry.find({}).then(entries => {
        response.json(entries)
    })
        .catch(error => next(error))
})

app.get('/info', (request, response) => {
    const time = new Date()
    Entry.countDocuments({})
        .then(count => {
            response.send(`
                <p>Phonebook has info for ${count} people</p>
                <p>${time}</p>
            `)
        })
})

app.get('/api/persons/:id', (request, response, next) => {
    Entry.findById(request.params.id).then((entry) => {
        if (entry) {
            response.json(entry)
        } else {
            response.status(404).end()
        }
    })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Entry.findByIdAndDelete(request.params.id).then(result => {
        response.status(204).end()
    })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const { name, number } = request.body

    if (!name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if (!number) {
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
        name: name,
        number: number
    })

    entry.save().then(savedEntry => {
        response.json(savedEntry)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Entry.findById(request.params.id)
        .then(entry => {
            if (!name) {
                return response.status(404).end()
            }

            entry.name = name
            entry.number = number

            return entry.save().then((updatedEntry => {
                response.json(updatedEntry)
            }))
        })
        .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})