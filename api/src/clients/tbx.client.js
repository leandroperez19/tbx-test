'use strict'

const axios = require('axios')
const config = require('../config')
const AppError = require('../errors/AppError')

/**
 * Instancia de axios preconfigurada para el API externo.
 *
 * - `timeout` evita que una descarga colgada bloquee la request indefinidamente.
 * - `authorization` se envía en todos los endpoints de la sección Secret.
 */
const http = axios.create({
  baseURL: config.externalApi.baseUrl,
  timeout: config.externalApi.timeoutMs,
  headers: { authorization: config.externalApi.apiKey }
})

/**
 * Obtiene el listado de archivos disponibles en el API externo.
 *
 * @returns {Promise<string[]>} Nombres de archivo.
 * @throws {AppError} 502 si el API externo falla o responde un cuerpo inesperado.
 */
async function listFiles () {
  try {
    const { data } = await http.get('/secret/files')

    if (!data || !Array.isArray(data.files)) {
      throw AppError.badGateway('El API externo devolvió un listado de archivos con formato inesperado')
    }

    return data.files
  } catch (error) {
    if (error instanceof AppError) throw error

    throw AppError.badGateway(`No se pudo obtener el listado de archivos: ${describeAxiosError(error)}`)
  }
}

/**
 * Descarga el contenido crudo de un archivo CSV.
 *
 * El endpoint `/secret/file/{name}` es el único del Swagger cuyo 200 no
 * declara un schema JSON: responde texto plano. Por eso se fuerza
 * `responseType: 'text'` y se anula `transformResponse`, para que axios no
 * intente interpretar el contenido.
 *
 * @param {string} name Nombre del archivo, ej. 'file1.csv'.
 * @returns {Promise<string>} Contenido crudo del CSV.
 * @throws {AppError} 502 si la descarga falla.
 */
async function downloadFile (name) {
  try {
    const { data } = await http.get(`/secret/file/${encodeURIComponent(name)}`, {
      responseType: 'text',
      transformResponse: [value => value]
    })

    return typeof data === 'string' ? data : ''
  } catch (error) {
    throw AppError.badGateway(`No se pudo descargar el archivo ${name}: ${describeAxiosError(error)}`)
  }
}

/**
 * Traduce un error de axios a un mensaje legible, sin filtrar detalles
 * internos al consumidor de la API.
 *
 * @param {Error} error
 * @returns {string}
 */
function describeAxiosError (error) {
  if (error.response) return `el API externo respondió ${error.response.status}`
  if (error.code === 'ECONNABORTED') return 'se agotó el tiempo de espera'
  return 'no hubo respuesta del API externo'
}

module.exports = { listFiles, downloadFile }
