'use strict'

const EXPECTED_COLUMNS = 4
const HEX_PATTERN = /^[0-9a-fA-F]{32}$/

/**
 * Valida y transforma una única fila del CSV.
 *
 * Una fila se considera válida cuando cumple todas estas condiciones:
 *  - tiene exactamente 4 columnas (file, text, number, hex)
 *  - ninguna columna viene vacía
 *  - `number` es un número finito
 *  - `hex` es un hexadecimal de 32 dígitos
 *
 * @param {string} row Fila cruda del CSV, sin el salto de línea.
 * @returns {{ text: string, number: number, hex: string }|null}
 *   La línea formateada, o null si la fila debe descartarse.
 */
function parseRow (row) {
  const columns = row.split(',').map(column => column.trim())

  if (columns.length !== EXPECTED_COLUMNS) return null
  if (columns.some(column => column === '')) return null

  const [, text, rawNumber, hex] = columns

  const number = Number(rawNumber)
  if (!Number.isFinite(number)) return null

  if (!HEX_PATTERN.test(hex)) return null

  return { text, number, hex }
}

/**
 * Convierte el contenido crudo de un CSV en la lista de líneas válidas.
 *
 * Es una función pura: no hace I/O ni lanza excepciones. Las filas inválidas
 * se descartan en silencio, tal como pide el enunciado. Un archivo vacío,
 * uno que solo tiene encabezado o uno completamente corrupto devuelven un
 * array vacío en lugar de romper el flujo.
 *
 * @param {string} content Contenido completo del archivo CSV.
 * @returns {Array<{ text: string, number: number, hex: string }>}
 */
function parseCsv (content) {
  if (typeof content !== 'string' || content.trim() === '') return []

  // Se contemplan finales de línea LF y CRLF: el API externo responde por
  // HTTP y el salto de línea puede venir en cualquiera de los dos formatos.
  const rows = content.split(/\r?\n/)

  // La primera fila es el encabezado (file,text,number,hex) y se descarta.
  return rows
    .slice(1)
    .map(parseRow)
    .filter(line => line !== null)
}

module.exports = { parseCsv, parseRow }
