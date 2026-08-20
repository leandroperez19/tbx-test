'use strict'

/**
 * Captura cualquier ruta no definida y la devuelve con el mismo formato
 * de error que el resto de la API.
 */
function notFoundHandler (req, res) {
  res.status(404).json({
    code: 'ROUTE_NOT_FOUND',
    message: `La ruta ${req.method} ${req.originalUrl} no existe`
  })
}

module.exports = notFoundHandler
