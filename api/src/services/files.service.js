'use strict'

const tbxClient = require('../clients/tbx.client')
const { parseCsv } = require('../utils/csvParser')
const { mapWithConcurrency } = require('../utils/concurrency')
const config = require('../config')
const AppError = require('../errors/AppError')

/**
 * Obtiene y formatea el contenido de los archivos del API externo.
 *
 * Decisiones de diseño:
 *  - Un archivo que se descarga pero cuyas líneas son todas inválidas se
 *    incluye igual con `lines: []`. Su existencia es un dato real.
 *  - Un archivo que falla al descargarse se omite del resultado: el enunciado
 *    contempla que esto ocurra, y una falla puntual no debe tumbar la
 *    respuesta completa.
 *  - Si en cambio se pidió UN archivo puntual por `fileName`, un fallo de
 *    descarga sí se propaga: devolver un array vacío ocultaría el problema
 *    justo cuando el consumidor pidió ese archivo y ninguno más.
 *
 * @param {{ fileName?: string }} [options]
 * @returns {Promise<Array<{ file: string, lines: object[] }>>}
 * @throws {AppError} 404 si `fileName` no existe; 502 si el API externo falla.
 */
async function getFilesData ({ fileName } = {}) {
  const availableFiles = await tbxClient.listFiles()

  if (fileName) {
    if (!availableFiles.includes(fileName)) {
      throw AppError.notFound(`El archivo ${fileName} no existe en el API externo`)
    }

    return [await processFile(fileName)]
  }

  const results = await mapWithConcurrency(
    availableFiles,
    config.maxConcurrentDownloads,
    processFileSafely
  )

  return results.filter(result => result !== null)
}

/**
 * Devuelve el listado de archivos disponibles con la misma forma que el
 * API externo: { files: [...] }.
 *
 * @returns {Promise<{ files: string[] }>}
 */
async function getFilesList () {
  const files = await tbxClient.listFiles()

  return { files }
}

/**
 * Descarga y formatea un archivo. Propaga cualquier error de descarga.
 *
 * @param {string} fileName
 * @returns {Promise<{ file: string, lines: object[] }>}
 */
async function processFile (fileName) {
  const content = await tbxClient.downloadFile(fileName)

  return { file: fileName, lines: parseCsv(content) }
}

/**
 * Variante tolerante a fallos: si el archivo no se puede descargar devuelve
 * null en lugar de lanzar, para que el resto del lote siga adelante.
 *
 * @param {string} fileName
 * @returns {Promise<{ file: string, lines: object[] }|null>}
 */
async function processFileSafely (fileName) {
  try {
    return await processFile(fileName)
  } catch (error) {
    console.warn(`Se omite el archivo ${fileName}: ${error.message}`)

    return null
  }
}

module.exports = { getFilesData, getFilesList }
