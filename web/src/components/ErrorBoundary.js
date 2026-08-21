'use strict'

import { Component } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'

/**
 * Captura las excepciones que ocurren durante el render del árbol de
 * componentes y muestra una interfaz alternativa en lugar de dejar la pantalla
 * en blanco.
 *
 * Es el único componente de clase de la aplicación: React no expone una API de
 * hooks equivalente, por lo que un error boundary debe implementarse con
 * `getDerivedStateFromError` y `componentDidCatch`.
 *
 * Alcance: sólo intercepta errores lanzados durante el render, en los métodos
 * de ciclo de vida y en los constructores. NO captura errores dentro de
 * manejadores de eventos ni de código asincrónico; esos casos se manejan en la
 * capa de servicios, que devuelve un resultado en vez de lanzar.
 */
class ErrorBoundary extends Component {
  constructor (props) {
    super(props)
    this.state = { hasError: false, error: null }
    this.handleReload = this.handleReload.bind(this)
  }

  static getDerivedStateFromError (error) {
    return { hasError: true, error }
  }

  componentDidCatch (error, errorInfo) {
    // En una aplicación real este es el punto donde se reportaría el error a un
    // servicio de monitoreo junto con el stack de componentes.
    console.error('Error no controlado en el render:', error, errorInfo)
  }

  handleReload () {
    window.location.reload()
  }

  render () {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <Container className='py-5'>
        <Alert variant='danger'>
          <Alert.Heading>Algo salió mal</Alert.Heading>
          <p>
            La aplicación encontró un error inesperado y no pudo continuar.
            Recargar la página suele resolverlo.
          </p>
          <hr />
          <div className='d-flex justify-content-between align-items-center'>
            <small className='text-muted'>{this.state.error?.message}</small>
            <Button variant='outline-danger' size='sm' onClick={this.handleReload}>
              Recargar
            </Button>
          </div>
        </Alert>
      </Container>
    )
  }
}

export default ErrorBoundary
