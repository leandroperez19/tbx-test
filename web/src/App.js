'use strict'

import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import useFilesData from './hooks/useFilesData'
import FileFilter from './components/FileFilter'
import FilesTable from './components/FilesTable'
import StatusMessage from './components/StatusMessage'

/**
 * Componente raíz de la aplicación.
 *
 * Decide qué renderizar según el estado de la carga y delega el detalle a los
 * componentes de presentación.
 */
function App () {
  const { status, data, error } = useFilesData()

  return (
    <>
      <Navbar className='app-navbar' expand='lg'>
        <Container fluid>
          <Navbar.Brand>React Test App</Navbar.Brand>
        </Container>
      </Navbar>

      <Container className='py-4'>
        <FileFilter />

        {status === 'success'
          ? <FilesTable files={data} />
          : <StatusMessage status={status} error={error} />}
      </Container>
    </>
  )
}

export default App