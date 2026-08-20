'use strict'

class AppError extends Error {
  /**
   * @param {number} status Código HTTP a devolver.
   * @param {string} code Código único de error, ej. 'FILE_NOT_FOUND'.
   * @param {string} message Mensaje legible para el consumidor.
   */
  constructor (status, code, message) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    Error.captureStackTrace(this, AppError)
  }

  static notFound (message) {
    return new AppError(404, 'FILE_NOT_FOUND', message)
  }

  static badGateway (message) {
    return new AppError(502, 'EXTERNAL_API_ERROR', message)
  }

  static badRequest (message) {
    return new AppError(400, 'INVALID_REQUEST', message)
  }
}

module.exports = AppError
