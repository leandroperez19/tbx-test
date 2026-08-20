'use strict'

const { expect } = require('chai')
const { mapWithConcurrency } = require('../../src/utils/concurrency')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

describe('concurrency', () => {
  describe('mapWithConcurrency()', () => {
    it('devuelve los resultados en el orden de entrada', async () => {
      const items = [30, 10, 20, 5]

      const result = await mapWithConcurrency(items, 2, async value => {
        await delay(value)
        return value * 2
      })

      expect(result).to.deep.equal([60, 20, 40, 10])
    })

    it('nunca supera el límite de tareas simultáneas', async () => {
      let running = 0
      let maxRunning = 0

      await mapWithConcurrency([1, 2, 3, 4, 5, 6], 2, async () => {
        running += 1
        maxRunning = Math.max(maxRunning, running)
        await delay(5)
        running -= 1
      })

      expect(maxRunning).to.equal(2)
    })

    it('soporta una lista vacía', async () => {
      expect(await mapWithConcurrency([], 3, async x => x)).to.deep.equal([])
    })

    it('pasa el índice a la función', async () => {
      const result = await mapWithConcurrency(['a', 'b'], 1, async (item, index) => `${index}:${item}`)

      expect(result).to.deep.equal(['0:a', '1:b'])
    })
  })
})