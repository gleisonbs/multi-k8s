const keys = require('./keys')

// Express App Setup
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
app.use(cors())
app.use(bodyParser.json())

// Postgres client setup
const { Pool } = require('pg')
const pgClient = new Pool({
    user: keys.pg.user,
    password: keys.pg.password,
    host: keys.pg.host,
    port: keys.pg.port,
    database: keys.pg.database
})
pgClient.on('error', () => console.log('Lost PG connection'))

pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err))

// Redis client setup
const redis = require('redis')
const redisClient = redis.createClient({
    host: keys.redis.host,
    port: keys.redis.port,
    retry_strategy: () => 1000
})
const redisPublisher = redisClient.duplicate()

app.get('/', (req, res) => {
    res.send('Hi')
})

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT number FROM values')
    res.send(values.rows)
})

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values)
    })
})

app.post('/values', async (req, res) => {
    const index = parseInt(req.body.index)

    if (index > 40)
        return res.status(422).send('value is too high')
    
    redisClient.hset('values', index, 'calculating...')
    redisPublisher.publish('insert', index)
    pgClient.query('INSERT INTO values (number) VALUES ($1)', [index])

    res.send({ working: true })
})

app.listen(5000, err => {
    console.log('Listening')
})