'use strict'

import Alert from 'react-bootstrap/Alert'
import Spinner from 'react-bootstrap/Spinner'

/**
 * Muestra el estado de la carga cuando todavía no hay datos que renderizar.
 *
 * @param {{ status: string, error: { code: string, message: string }|null }} props
 */
function StatusMessage ({ status, error }) {
  if (status === 'loading') {
    return (
      <div className='text-center py-5'>
        <Spinner animation='border' role='status' variant='secondary'>
          <span className='visually-hidden'>Cargando archivos…</span>
        </Spinner>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <Alert variant='danger'>
        <Alert.Heading>No se pudieron cargar los archivos</Alert.Heading>
        <p className='mb-0'>{error?.message}</p>
        {error?.code && <small className='text-muted'>Código: {error.code}</small>}
      </Alert>
    )
  }

  return null
}

export default StatusMessage
