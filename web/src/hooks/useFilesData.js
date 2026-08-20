'use strict'

import { useEffect, useState } from 'react'
import { getFilesData } from '../services/filesService'

/**
 * Hook que obtiene los datos de los archivos desde la API.
 *
 * Expone una máquina de estados simple —loading, success o error— en lugar de
 * varios booleanos independientes, de modo que no puedan existir combinaciones
 * contradictorias como "cargando y con error a la vez".
 *
 * @param {{ fileName?: string }} [options] Filtra por un archivo puntual.
 * @returns {{ status: 'loading'|'success'|'error', files: object[], error: object|null }}
 */
function useFilesData ({ fileName } = {}) {
  const [state, setState] = useState({ status: 'loading', files: [], error: null })

  useEffect(() => {
    // Evita actualizar el estado si el componente se desmontó antes de que la
    // request terminara, o si llegó una petición más nueva.
    let active = true

    setState({ status: 'loading', files: [], error: null })

    getFilesData({ fileName }).then(result => {
      if (!active) return

      if (result.status === 'success') {
        setState({ status: 'success', files: result.data, error: null })
      } else {
        setState({ status: 'error', files: [], error: result.error })
      }
    })

    return () => {
      active = false
    }
  }, [fileName])

  return state
}

export default useFilesData