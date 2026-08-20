'use strict'

/**
 * Muestras de contenido CSV usadas por los tests unitarios del parser.
 */
const HEADER = 'file,text,number,hex'

const VALID_HEX = '70ad29aacf0b690b0467fe2b2767f765'
const OTHER_HEX = 'd33a8ca5d36d3106219f66f939774cf5'

module.exports = {
  HEADER,
  VALID_HEX,
  OTHER_HEX,

  valid: [
    HEADER,
    `file1.csv,RgTya,64075909,${VALID_HEX}`,
    `file1.csv,AtjW,6,${OTHER_HEX}`
  ].join('\n'),

  onlyHeader: HEADER,

  empty: '',

  withCrlf: [
    HEADER,
    `file1.csv,RgTya,64075909,${VALID_HEX}`
  ].join('\r\n'),

  missingColumn: [
    HEADER,
    `file1.csv,RgTya,${VALID_HEX}`,
    `file1.csv,AtjW,6,${OTHER_HEX}`
  ].join('\n'),

  extraColumn: [
    HEADER,
    `file1.csv,RgTya,64075909,${VALID_HEX},extra`,
    `file1.csv,AtjW,6,${OTHER_HEX}`
  ].join('\n'),

  emptyField: [
    HEADER,
    `file1.csv,,64075909,${VALID_HEX}`,
    `file1.csv,AtjW,6,${OTHER_HEX}`
  ].join('\n'),

  invalidNumber: [
    HEADER,
    `file1.csv,RgTya,noEsUnNumero,${VALID_HEX}`,
    `file1.csv,AtjW,6,${OTHER_HEX}`
  ].join('\n'),

  invalidHex: [
    HEADER,
    'file1.csv,RgTya,64075909,abc123',
    `file1.csv,AtjW,6,${OTHER_HEX}`
  ].join('\n'),

  trailingNewline: [
    HEADER,
    `file1.csv,RgTya,64075909,${VALID_HEX}`,
    '',
    ''
  ].join('\n')
}