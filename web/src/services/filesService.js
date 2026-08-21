'use strict'

import { doGet } from './requestHandler'

/**
 * Valida una línea individual devuelta por la API.
 *
 * @param {unknown} line
 * @returns {{ text: string, number: number, hex: string }}
 * @throws {TypeError} Si la línea no tiene la forma esperada.
 */
function parseLine (line) {
  if (!line || typeof line !== 'object') {
    throw new TypeError('Se esperaba un objeto por línea')
  }

  const { text, number, hex } = line

  if (typeof text !== 'string' || typeof number !== 'number' || typeof hex !== 'string') {
    throw new TypeError('Una línea no tiene el formato esperado')
  }

  return { text, number, hex }
}

/**
 * Valida la respuesta completa de `GET /files/data`.
 *
 * Aplica en el cliente la misma disciplina que la API aplica sobre los CSV del
 * servicio externo: no se asume la forma de un dato que viene de afuera.
 *
 * @param {unknown} data
 * @returns {Array<{ file: string, lines: object[] }>}
 * @throws {TypeError} Si la respuesta no tiene la forma esperada.
 */
function parseFilesData (data) {
  if (!Array.isArray(data)) {
    throw new TypeError('Se esperaba un array de archivos')
  }

  return data.map(entry => {
    if (!entry || typeof entry.file !== 'string' || !Array.isArray(entry.lines)) {
      throw new TypeError('Un archivo no tiene el formato esperado')
    }

    return { file: entry.file, lines: entry.lines.map(parseLine) }
  })
}

/**
 * Valida la respuesta de `GET /files/list`.
 *
 * @param {unknown} data
 * @returns {string[]}
 * @throws {TypeError} Si la respuesta no tiene la forma esperada.
 */
function parseFilesList (data) {
  if (!data || !Array.isArray(data.files)) {
    throw new TypeError('Se esperaba un objeto con la propiedad files')
  }

  if (!data.files.every(file => typeof file === 'string')) {
    throw new TypeError('El listado de archivos debe contener solo strings')
  }

  return data.files
}

/**
 * Obtiene el contenido formateado de los archivos.
 *
 * @param {{ fileName?: string }} [options] Filtra por un archivo puntual.
 */
export function getFilesData ({ fileName } = {}) {
  const path = fileName
    ? `/files/data?fileName=${encodeURIComponent(fileName)}`
    : '/files/data'

  return doGet(path, parseFilesData)
}

/**
 * Obtiene el listado de archivos disponibles.
 */
export function getFilesList () {
  return doGet('/files/list', parseFilesList)
}
