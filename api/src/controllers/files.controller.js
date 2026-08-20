'use strict'

const filesService = require('../services/files.service')
const AppError = require('../errors/AppError')

/**
 * GET /files/data
 *
 * Devuelve el contenido formateado de los archivos. Acepta el query param
 * opcional `fileName` para limitar la respuesta a un único archivo.
 */
async function getData (req, res) {
  const fileName = readFileNameParam(req.query.fileName)
  const data = await filesService.getFilesData({ fileName })

  res.type('application/json').status(200).json(data)
}

/**
 * GET /files/list
 *
 * Devuelve el listado de archivos disponibles.
 */
async function getList (req, res) {
  const data = await filesService.getFilesList()

  res.type('application/json').status(200).json(data)
}

/**
 * Normaliza y valida el query param `fileName`.
 *
 * Express expone un array cuando el parámetro llega repetido en la URL, y un
 * objeto cuando llega con notación de corchetes. Ambos casos se rechazan de
 * forma explícita en lugar de dejar que un tipo inesperado se propague hacia
 * el service.
 *
 * @param {unknown} value Valor crudo de `req.query.fileName`.
 * @returns {string|undefined} El nombre saneado, o undefined si no se envió.
 * @throws {AppError} 400 si el valor no es un string simple y no vacío.
 */
function readFileNameParam (value) {
  if (value === undefined) return undefined

  if (typeof value !== 'string') {
    throw AppError.badRequest('El parámetro fileName debe enviarse una sola vez y como texto')
  }

  const fileName = value.trim()

  if (fileName === '') {
    throw AppError.badRequest('El parámetro fileName no puede estar vacío')
  }

  return fileName
}

module.exports = { getData, getList }