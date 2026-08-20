'use strict'

const express = require('express')
const filesRoutes = require('./routes/files.routes')
const notFoundHandler = require('./middlewares/notFoundHandler')
const errorHandler = require('./middlewares/errorHandler')

/**
 * Construye la app de Express sin levantar el servidor.
 *
 * Separar `app` de `server` permite que los tests de integración importen
 * la app y le peguen con supertest sin abrir un puerto real.
 */
function createApp () {
  const app = express()

  app.use(express.json())

  app.use('/files', filesRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

module.exports = createApp
