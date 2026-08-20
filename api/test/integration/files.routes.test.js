'use strict'

const request = require('supertest')
const nock = require('nock')
const { expect } = require('chai')
const createApp = require('../../src/app')
const config = require('../../src/config')
const samples = require('../fixtures/csvSamples')

const BASE_URL = config.externalApi.baseUrl

describe('rutas de /files', () => {
  let app

  beforeEach(() => {
    app = createApp()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('GET /files/data', () => {
    it('responde 200 con content-type application/json', async () => {
      nock(BASE_URL).get('/secret/files').reply(200, { files: ['file1.csv'] })
      nock(BASE_URL).get('/secret/file/file1.csv').reply(200, samples.valid)

      const response = await request(app).get('/files/data')

      expect(response.status).to.equal(200)
      expect(response.headers['content-type']).to.match(/application\/json/)
    })

    it('devuelve los archivos con sus líneas formateadas', async () => {
      nock(BASE_URL).get('/secret/files').reply(200, { files: ['file1.csv'] })
      nock(BASE_URL).get('/secret/file/file1.csv').reply(200, samples.valid)

      const { body } = await request(app).get('/files/data')

      expect(body).to.be.an('array').with.lengthOf(1)
      expect(body[0]).to.have.keys(['file', 'lines'])
      expect(body[0].lines[0]).to.deep.equal({
        text: 'RgTya',
        number: 64075909,
        hex: samples.VALID_HEX
      })
    })

    it('omite los archivos que fallan al descargarse', async () => {
      nock(BASE_URL).get('/secret/files').reply(200, { files: ['ok.csv', 'roto.csv'] })
      nock(BASE_URL).get('/secret/file/ok.csv').reply(200, samples.valid)
      nock(BASE_URL).get('/secret/file/roto.csv').reply(500)

      const { body } = await request(app).get('/files/data')

      expect(body).to.have.lengthOf(1)
      expect(body[0].file).to.equal('ok.csv')
    })

    it('responde 502 cuando el API externo no está disponible', async () => {
      nock(BASE_URL).get('/secret/files').reply(500)

      const response = await request(app).get('/files/data')

      expect(response.status).to.equal(502)
      expect(response.body.code).to.equal('EXTERNAL_API_ERROR')
      expect(response.body).to.have.property('message')
    })

    describe('con ?fileName=', () => {
      it('devuelve solamente el archivo pedido', async () => {
        nock(BASE_URL).get('/secret/files').reply(200, { files: ['a.csv', 'b.csv'] })
        nock(BASE_URL).get('/secret/file/b.csv').reply(200, samples.valid)

        const { body } = await request(app).get('/files/data?fileName=b.csv')

        expect(body).to.have.lengthOf(1)
        expect(body[0].file).to.equal('b.csv')
      })

      it('responde 404 si el archivo no existe', async () => {
        nock(BASE_URL).get('/secret/files').reply(200, { files: ['a.csv'] })

        const response = await request(app).get('/files/data?fileName=noExiste.csv')

        expect(response.status).to.equal(404)
        expect(response.body.code).to.equal('FILE_NOT_FOUND')
      })

      it('responde 400 si el parámetro viene vacío', async () => {
        const response = await request(app).get('/files/data?fileName=')

        expect(response.status).to.equal(400)
        expect(response.body.code).to.equal('INVALID_REQUEST')
      })

      it('responde 400 si el parámetro viene repetido', async () => {
        const response = await request(app).get('/files/data?fileName=a.csv&fileName=b.csv')

        expect(response.status).to.equal(400)
      })
    })
  })

  describe('GET /files/list', () => {
    it('devuelve el listado de archivos', async () => {
      nock(BASE_URL).get('/secret/files').reply(200, { files: ['a.csv', 'b.csv'] })

      const response = await request(app).get('/files/list')

      expect(response.status).to.equal(200)
      expect(response.body).to.deep.equal({ files: ['a.csv', 'b.csv'] })
    })

    it('responde 502 si el API externo falla', async () => {
      nock(BASE_URL).get('/secret/files').reply(503)

      const response = await request(app).get('/files/list')

      expect(response.status).to.equal(502)
    })
  })

  describe('rutas inexistentes', () => {
    it('responde 404 con el mismo contrato de error', async () => {
      const response = await request(app).get('/ruta/que/no/existe')

      expect(response.status).to.equal(404)
      expect(response.body.code).to.equal('ROUTE_NOT_FOUND')
      expect(response.body).to.have.property('message')
    })
  })
})