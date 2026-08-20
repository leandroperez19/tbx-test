'use strict'

/**
 * Configuración de la aplicación.
 *
 * Cada valor tiene un default funcional: las variables de entorno son solo un override
 * opcional para desarrollo o despliegue.
 */
module.exports = {
  port: Number(process.env.PORT) || 3000,

  externalApi: {
    baseUrl: process.env.EXTERNAL_API_URL || 'https://echo-serv.tbxnet.com/v1',
    apiKey: process.env.EXTERNAL_API_KEY || 'Bearer aSuperSecretKey',
    // Sin timeout, un archivo que cuelga deja la request colgada para siempre.
    timeoutMs: Number(process.env.EXTERNAL_API_TIMEOUT_MS) || 10000
  },

  // Cantidad de descargas simultáneas contra el API externo.
  maxConcurrentDownloads: Number(process.env.MAX_CONCURRENT_DOWNLOADS) || 5
}
