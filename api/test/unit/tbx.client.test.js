'use strict'

const nock = require('nock')
const { expect } = require('chai')
const config = require('../../src/config')
const client = require('../../src/clients/tbx.client')
const samples = require('../fixtures/csvSamples')

const BASE_URL = config.externalApi.baseUrl

describe('tbx.client', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  describe('listFiles()', () => {
    it('devuelve el listado de archivos', async () => {
      nock(BASE_URL)
        .get('/secret/files')
        .reply(200, { files: ['file1.csv', 'file2.csv'] })

      const files = await client.listFiles()

      expect(files).to.deep.equal(['file1.csv', 'file2.csv'])
    })

    it('envía el header de authorization', async () => {
      const scope = nock(BASE_URL, {
        reqheaders: { authorization: config.externalApi.apiKey }
      })
        .get('/secret/files')
        .reply(200, { files: [] })

      await client.listFiles()

      expect(scope.isDone()).to.equal(true)
    })

    it('lanza un error 502 cuando el API externo responde 500', async () => {
      nock(BASE_URL).get('/secret/files').reply(500, { code: 'ERR', message: 'boom' })

      const error = await client.listFiles().catch(e => e)

      expect(error.status).to.equal(502)
      expect(error.code).to.equal('EXTERNAL_API_ERROR')
    })

    it('lanza un error 502 cuando el cuerpo no tiene la forma esperada', async () => {
      nock(BASE_URL).get('/secret/files').reply(200, { algoRaro: true })

      const error = await client.listFiles().catch(e => e)

      expect(error.status).to.equal(502)
    })
  })

  describe('downloadFile()', () => {
    it('devuelve el contenido crudo del CSV como string', async () => {
      nock(BASE_URL)
        .get('/secret/file/file1.csv')
        .reply(200, samples.valid, { 'content-type': 'text/csv' })

      const content = await client.downloadFile('file1.csv')

      expect(content).to.be.a('string')
      expect(content).to.contain('RgTya')
    })

    it('no intenta parsear el contenido como JSON', async () => {
      nock(BASE_URL)
        .get('/secret/file/file1.csv')
        .reply(200, samples.valid, { 'content-type': 'application/json' })

      const content = await client.downloadFile('file1.csv')

      expect(content).to.be.a('string')
    })

    it('lanza un error 502 cuando la descarga falla', async () => {
      nock(BASE_URL).get('/secret/file/file1.csv').reply(500)

      const error = await client.downloadFile('file1.csv').catch(e => e)

      expect(error.status).to.equal(502)
      expect(error.message).to.contain('file1.csv')
    })

    it('lanza un error 502 cuando no hay respuesta de red', async () => {
      nock(BASE_URL)
        .get('/secret/file/file1.csv')
        .replyWithError({ code: 'ECONNREFUSED' })

      const error = await client.downloadFile('file1.csv').catch(e => e)

      expect(error.status).to.equal(502)
    })

    it('codifica el nombre del archivo en la URL', async () => {
      const scope = nock(BASE_URL)
        .get('/secret/file/mi%20archivo.csv')
        .reply(200, samples.onlyHeader)

      await client.downloadFile('mi archivo.csv')

      expect(scope.isDone()).to.equal(true)
    })
  })
})