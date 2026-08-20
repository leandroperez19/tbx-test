'use strict'

const AppError = require('../errors/AppError')

/**
 * Middleware de manejo de errores.
 *
 * Toda respuesta de error sale con el mismo formato { code, message } y con
 * el status HTTP correcto en el header.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler (err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ code: err.code, message: err.message })
  }

  console.error('Error no controlado:', err)

  return res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Ocurrió un error inesperado procesando la solicitud'
  })
}

module.exports = errorHandler
