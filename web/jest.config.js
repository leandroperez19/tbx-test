'use strict'

module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/test'],
  moduleNameMapper: {
    // Los estilos no aportan nada al render en los tests y jsdom no los procesa.
    '\\.css$': '<rootDir>/test/__mocks__/styleMock.js'
  },
  clearMocks: true
}