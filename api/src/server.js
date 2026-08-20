'use strict'

const createApp = require('./app')
const config = require('./config')

const app = createApp()

app.listen(config.port, () => {
  console.log(`API escuchando en http://localhost:${config.port}`)
})
