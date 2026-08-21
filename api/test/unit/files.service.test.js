'use strict'

const nock = require('nock')
const { expect } = require('chai')
const config = require('../../src/config')
const service = require('../../src/services/files.service')
const samples = require('../fixtures/csvSamples')

const BASE_URL = config.externalApi.baseUrl

describe('files.service', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  describe('getFilesData()', () => {
    it('devuelve un objeto por archivo con sus líneas formateadas', async () => {
      nock(BASE_URL).get('/secret/files').reply(200, { files: ['file1.csv'] })
      nock(BASE_URL).get('/secret/file/file1.csv').reply(200, samples.valid)

      const result = await service.getFilesData()

      expect(result).to.have.lengthOf(1)
      expect(result[0].file).to.equal('file1.csv')
      expect(result[0].lines).to.have.lengthOf(2)
    })

    it('procesa varios archivos', async () => {
      nock(BASE_URL).get('/secret/files').reply(200, { files: ['a.csv', 'b.csv'] })
      nock(BASE_URL).get('/secret/file/a.csv').reply(200, samples.valid)
      nock(BASE_URL).get('/secret/file/b.csv').reply(200, samples.withCrlf)

      const result = await service.getFilesData()

      expect(result.map(item => item.file)).to.deep.equal(['a.csv', 'b.csv'])
    })

    it('omite los archivos que fallan al descargarse', async () => {
      nock(BASE_URL).get('/secret/files').reply(200, { files: ['ok.csv', 'roto.csv'] })
      nock(BASE_URL).get('/secret/file/ok.csv').reply(200, samples.valid)
      nock(BASE_URL).get('/secret/file/roto.csv').reply(500)

      const result = await service.getFilesData()

      expect(result).to.have.lengthOf(1)
      expect(result[0].file).to.equal('ok.csv')
    })

    it('incluye el archivo vacío con lines vacío', async () => {
      nock(BASE_URL).get('/secret/files').reply(200, { files: ['vacio.csv'] })
      nock(BASE_URL).get('/secret/file/vacio.csv').reply(200, samples.onlyHeader)

      const result = await service.getFilesData()

      expect(result).to.deep.equal([{ file: 'vacio.csv', lines: [] }])
    })

    it('devuelve un array vacío cuando no hay archivos', async () => {
      nock(BASE_URL).get('/secret/files').reply(200, { files: [] })

      expect(await service.getFilesData()).to.deep.equal([])
    })

    describe('con filtro por fileName', () => {
      it('procesa solamente el archivo pedido', async () => {
        nock(BASE_URL).get('/secret/files').reply(200, { files: ['a.csv', 'b.csv'] })
        nock(BASE_URL).get('/secret/file/b.csv').reply(200, samples.valid)

        const result = await service.getFilesData({ fileName: 'b.csv' })

        expect(result).to.have.lengthOf(1)
        expect(result[0].file).to.equal('b.csv')
      })

      it('lanza 404 si el archivo no está en el listado', async () => {
        nock(BASE_URL).get('/secret/files').reply(200, { files: ['a.csv'] })

        const error = await service.getFilesData({ fileName: 'noExiste.csv' }).catch(e => e)

        expect(error.status).to.equal(404)
        expect(error.code).to.equal('FILE_NOT_FOUND')
      })

      it('propaga el error si falla la descarga del archivo pedido', async () => {
        nock(BASE_URL).get('/secret/files').reply(200, { files: ['a.csv'] })
        nock(BASE_URL).get('/secret/file/a.csv').reply(500)

        const error = await service.getFilesData({ fileName: 'a.csv' }).catch(e => e)

        expect(error.status).to.equal(502)
      })
    })

    it('propaga el error si falla el listado de archivos', async () => {
      nock(BASE_URL).get('/secret/files').reply(500)

      const error = await service.getFilesData().catch(e => e)

      expect(error.status).to.equal(502)
    })
  })

  describe('getFilesList()', () => {
    it('devuelve el listado con la misma forma que el API externo', async () => {
      nock(BASE_URL).get('/secret/files').reply(200, { files: ['a.csv', 'b.csv'] })

      expect(await service.getFilesList()).to.deep.equal({ files: ['a.csv', 'b.csv'] })
    })
  })
})
