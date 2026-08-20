'use strict'

/**
 * Habilita CORS para que el cliente web pueda consumir la API.
 *
 * El frontend corre en un origen distinto (puerto 8080) al de la API
 * (puerto 3000), por lo que el navegador bloquearía las respuestas sin estas
 * cabeceras. Se implementa a mano en lugar de sumar la dependencia `cors`:
 * la API solo expone endpoints GET públicos y de solo lectura.
 */
function cors (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }

  next()
}

module.exports = cors