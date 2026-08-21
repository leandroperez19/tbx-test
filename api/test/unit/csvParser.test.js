'use strict'

const { expect } = require('chai')
const { parseCsv } = require('../../src/utils/csvParser')
const samples = require('../fixtures/csvSamples')

describe('csvParser', () => {
  describe('parseCsv()', () => {
    it('formatea las líneas válidas descartando la columna file', () => {
      const result = parseCsv(samples.valid)

      expect(result).to.have.lengthOf(2)
      expect(result[0]).to.deep.equal({
        text: 'RgTya',
        number: 64075909,
        hex: samples.VALID_HEX
      })
    })

    it('devuelve number como tipo numérico y no como string', () => {
      const [first] = parseCsv(samples.valid)

      expect(first.number).to.be.a('number')
    })

    it('devuelve un array vacío cuando el archivo está vacío', () => {
      expect(parseCsv(samples.empty)).to.deep.equal([])
    })

    it('devuelve un array vacío cuando solo hay encabezado', () => {
      expect(parseCsv(samples.onlyHeader)).to.deep.equal([])
    })

    it('devuelve un array vacío ante una entrada que no es string', () => {
      expect(parseCsv(null)).to.deep.equal([])
      expect(parseCsv(undefined)).to.deep.equal([])
      expect(parseCsv(42)).to.deep.equal([])
    })

    it('soporta finales de línea CRLF', () => {
      const result = parseCsv(samples.withCrlf)

      expect(result).to.have.lengthOf(1)
      expect(result[0].hex).to.equal(samples.VALID_HEX)
    })

    it('ignora las líneas en blanco del final del archivo', () => {
      expect(parseCsv(samples.trailingNewline)).to.have.lengthOf(1)
    })

    describe('descarte de líneas inválidas', () => {
      it('descarta la línea a la que le falta una columna', () => {
        const result = parseCsv(samples.missingColumn)

        expect(result).to.have.lengthOf(1)
        expect(result[0].text).to.equal('AtjW')
      })

      it('descarta la línea que tiene columnas de más', () => {
        expect(parseCsv(samples.extraColumn)).to.have.lengthOf(1)
      })

      it('descarta la línea con un campo vacío', () => {
        expect(parseCsv(samples.emptyField)).to.have.lengthOf(1)
      })

      it('descarta la línea cuyo number no es numérico', () => {
        expect(parseCsv(samples.invalidNumber)).to.have.lengthOf(1)
      })

      it('descarta la línea cuyo hex no tiene 32 dígitos', () => {
        expect(parseCsv(samples.invalidHex)).to.have.lengthOf(1)
      })

      it('conserva siempre las líneas válidas aunque otras fallen', () => {
        const result = parseCsv(samples.invalidNumber)

        expect(result[0]).to.deep.equal({
          text: 'AtjW',
          number: 6,
          hex: samples.OTHER_HEX
        })
      })
    })
  })
})
