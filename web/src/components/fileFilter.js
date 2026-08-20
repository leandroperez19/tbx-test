'use strict'

import { useDispatch, useSelector } from 'react-redux'
import Form from 'react-bootstrap/Form'
import { fileSelected, selectAvailableFiles, selectSelectedFile } from '../store/filesSlice'

/**
 * Selector que filtra la tabla por un archivo puntual.
 *
 * Se alimenta del endpoint `GET /files/list` y, al cambiar, dispara una nueva
 * consulta a `GET /files/data?fileName=`.
 */
function FileFilter () {
  const dispatch = useDispatch()
  const availableFiles = useSelector(selectAvailableFiles)
  const selectedFile = useSelector(selectSelectedFile)

  if (availableFiles.length === 0) return null

  return (
    <Form.Group controlId='file-filter' className='mb-4' style={{ maxWidth: '20rem' }}>
      <Form.Label>Filtrar por archivo</Form.Label>
      <Form.Select
        value={selectedFile}
        onChange={event => dispatch(fileSelected(event.target.value))}
      >
        <option value=''>Todos los archivos</option>
        {availableFiles.map(file => (
          <option key={file} value={file}>{file}</option>
        ))}
      </Form.Select>
    </Form.Group>
  )
}

export default FileFilter