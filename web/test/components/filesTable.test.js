'use strict'

import '@testing-library/jest-dom'
import { render, screen, within } from '@testing-library/react'
import FilesTable from '../../src/components/FilesTable'
import { filesFixture } from '../__mocks__/filesData'

describe('FilesTable', () => {
  it('renderiza el encabezado con las cuatro columnas del wireframe', () => {
    render(<FilesTable files={filesFixture} />)

    const headers = screen.getAllByRole('columnheader').map(header => header.textContent)

    expect(headers).toEqual(['File Name', 'Text', 'Number', 'Hex'])
  })

  it('aplana las líneas agrupadas en una fila por línea', () => {
    render(<FilesTable files={filesFixture} />)

    // 3 líneas válidas en total, más la fila del encabezado.
    expect(screen.getAllByRole('row')).toHaveLength(4)
  })

  it('repite el nombre del archivo en cada una de sus líneas', () => {
    render(<FilesTable files={filesFixture} />)

    expect(screen.getAllByText('test3.csv')).toHaveLength(2)
  })

  it('muestra los valores de cada línea en su fila', () => {
    render(<FilesTable files={filesFixture} />)

    const row = screen.getByText('vsilKcaZzmdCBUBqeyATDBq').closest('tr')

    expect(within(row).getByText('test2.csv')).toBeInTheDocument()
    expect(within(row).getByText('80096')).toBeInTheDocument()
    expect(within(row).getByText('79f64e2ebf91b9e0976f03ed7822db95')).toBeInTheDocument()
  })

  it('omite los archivos sin líneas válidas', () => {
    render(<FilesTable files={filesFixture} />)

    expect(screen.queryByText('test1.csv')).not.toBeInTheDocument()
  })

  it('muestra un aviso cuando ningún archivo tiene líneas', () => {
    render(<FilesTable files={[{ file: 'test1.csv', lines: [] }]} />)

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByText(/no hay líneas para mostrar/i)).toBeInTheDocument()
  })

  it('muestra el aviso cuando la lista de archivos viene vacía', () => {
    render(<FilesTable files={[]} />)

    expect(screen.getByText(/no hay líneas para mostrar/i)).toBeInTheDocument()
  })
})
