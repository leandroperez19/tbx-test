'use strict'

/**
 * Envuelve un handler asíncrono para que sus rechazos lleguen al middleware
 * de errores.
 *
 * Express 4 no captura las promesas rechazadas de un handler `async`: si no se
 * las encadena a `next`, la request queda colgada hasta el timeout del cliente.
 * Este wrapper evita repetir un try/catch en cada controlador.
 *
 * @param {Function} handler Handler asíncrono de Express.
 * @returns {Function} Handler con el manejo de errores ya conectado.
 */
function asyncHandler (handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

module.exports = asyncHandler
