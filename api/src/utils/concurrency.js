'use strict'

/**
 * Recorre una lista aplicando una función asíncrona con un límite de
 * ejecuciones simultáneas.
 *
 * Descargar todos los archivos con un `Promise.all` sin límite abre tantas
 * conexiones como archivos haya, lo que puede saturar el API externo. Un
 * `for...of` secuencial, en cambio, desperdicia tiempo esperando una descarga
 * por vez. Este helper es el punto medio: mantiene N descargas en vuelo.
 *
 * El orden del resultado respeta el orden de entrada, sin importar en qué
 * orden terminen las tareas.
 *
 * @template T, R
 * @param {T[]} items Elementos a procesar.
 * @param {number} limit Cantidad máxima de tareas simultáneas.
 * @param {(item: T, index: number) => Promise<R>} iteratee Función a aplicar.
 * @returns {Promise<R[]>} Resultados en el mismo orden que `items`.
 */
async function mapWithConcurrency (items, limit, iteratee) {
  const results = new Array(items.length)
  const workerCount = Math.max(1, Math.min(limit, items.length))
  let cursor = 0

  const workers = Array.from({ length: workerCount }, async () => {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await iteratee(items[index], index)
    }
  })

  await Promise.all(workers)

  return results
}

module.exports = { mapWithConcurrency }
