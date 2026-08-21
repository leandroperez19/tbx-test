'use strict'

import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import StatusMessage from '../../src/components/StatusMessage'

describe('StatusMessage', () => {
  it('muestra un indicador de carga mientras el estado es loading', () => {
    render(<StatusMessage status='loading' error={null} />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra el mensaje del error cuando la carga falla', () => {
    const error = { code: 'EXTERNAL_API_ERROR', message: 'No se pudo obtener el listado' }

    render(<StatusMessage status='error' error={error} />)

    expect(screen.getByText('No se pudo obtener el listado')).toBeInTheDocument()
  })

  it('muestra el código del error para facilitar el diagnóstico', () => {
    const error = { code: 'NETWORK_ERROR', message: 'Sin conexión' }

    render(<StatusMessage status='error' error={error} />)

    expect(screen.getByText(/NETWORK_ERROR/)).toBeInTheDocument()
  })

  it('no renderiza nada cuando el estado es success', () => {
    const { container } = render(<StatusMessage status='success' error={null} />)

    expect(container).toBeEmptyDOMElement()
  })
})
