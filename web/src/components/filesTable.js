'use strict'

import Alert from 'react-bootstrap/Alert'
import Table from 'react-bootstrap/Table'

/**
 * Aplana la respuesta de la API en filas planas para la tabla.
 *
 * La API agrupa las líneas por archivo, pero el wireframe muestra una fila por
 * línea repitiendo el nombre del archivo. La transformación se hace acá y no en
 * la API para no alterar el contrato de respuesta que define el enunciado.
 *
 * @param {Array<{ file: string, lines: object[] }>} files
 * @returns {Array<{ file: string, text: string, number: number, hex: string }>}
 */
function toRows (files) {
  return files.flatMap(({ file, lines }) =>
    lines.map(line => ({ file, ...line }))
  )
}

/**
 * Tabla con el contenido de todos los archivos.
 *
 * @param {{ files: Array<{ file: string, lines: object[] }> }} props
 */
function FilesTable ({ files }) {
  const rows = toRows(files)

  if (rows.length === 0) {
    return (
      <Alert variant='info'>
        No hay líneas para mostrar. Los archivos disponibles no contienen datos válidos.
      </Alert>
    )
  }

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>File Name</th>
          <th>Text</th>
          <th>Number</th>
          <th>Hex</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={`${row.file}-${row.hex}-${index}`}>
            <td>{row.file}</td>
            <td>{row.text}</td>
            <td>{row.number}</td>
            <td className='hex-cell'>{row.hex}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default FilesTable