'use strict'

import axios from 'axios'

/**
 * Instancia de axios apuntando a la API.
 *
 * `API_BASE_URL` se inyecta en tiempo de build mediante DefinePlugin, con un
 * valor por defecto funcional para no depender de variables de entorno.
 */
const http = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 30000
})

const UNKNOWN_ERROR = {
  code: 'UNKNOWN_ERROR',
  message: 'Ocurrió un error inesperado al comunicarse con la API'
}

/**
 * Verifica que un valor tenga la forma del contrato de error de la API:
 * { code: string, message: string }.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isApiError (value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    typeof value.code === 'string' && value.code.length > 0 &&
    typeof value.message === 'string' && value.message.length > 0
  )
}

/**
 * Normaliza cualquier error al contrato { code, message } de la API.
 *
 * @param {unknown} error
 * @returns {{ code: string, message: string }}
 */
function toApiError (error) {
  if (axios.isAxiosError(error)) {
    if (isApiError(error.response && error.response.data)) {
      const { code, message } = error.response.data

      return { code, message }
    }

    if (error.code === 'ECONNABORTED') {
      return { code: 'TIMEOUT', message: 'La API tardó demasiado en responder' }
    }

    if (!error.response) {
      return { code: 'NETWORK_ERROR', message: 'No se pudo conectar con la API' }
    }
  }

  // Un error del parser significa que la API respondió algo con una forma
  // distinta a la esperada.
  if (error instanceof TypeError || error instanceof SyntaxError) {
    return {
      code: 'INVALID_RESPONSE',
      message: 'La API devolvió una respuesta con formato inesperado'
    }
  }

  return UNKNOWN_ERROR
}

/**
 * Ejecuta una request y devuelve siempre un resultado discriminado, nunca
 * una excepción.
 *
 * Devolver `{ status: 'success' | 'error' }` en lugar de lanzar obliga a quien
 * consume a contemplar el caso de error de forma explícita.
 *
 * El `parser` se recibe por parámetro: esta capa conoce el transporte, no la
 * forma de los datos. Cada servicio decide cómo validar su respuesta, de modo
 * que un cambio inesperado en el contrato de la API se detecta acá y no más
 * adelante, al renderizar.
 *
 * @param {() => Promise<object>} request
 * @param {(data: unknown) => any} parser Valida y transforma el cuerpo. Debe lanzar si no es válido.
 * @returns {Promise<object>} { status: 'success', data } o { status: 'error', error }
 */
async function doRequest (request, parser) {
  try {
    const response = await request()

    return { status: 'success', data: parser(response.data) }
  } catch (error) {
    return { status: 'error', error: toApiError(error) }
  }
}

/**
 * @param {string} path Ruta relativa a la base de la API.
 * @param {(data: unknown) => any} parser
 */
export function doGet (path, parser) {
  return doRequest(() => http.get(path), parser)
}