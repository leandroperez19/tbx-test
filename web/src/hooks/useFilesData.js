'use strict'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchFilesData,
  fetchFilesList,
  selectFilesState,
  selectSelectedFile
} from '../store/filesSlice'

/**
 * Conecta la vista con el estado de archivos del store.
 *
 * Encapsular `useSelector` y `useDispatch` acá mantiene a los componentes
 * ajenos a Redux: reciben datos y no conocen la librería de estado, de modo
 * que cambiarla no obligaría a tocar la capa de presentación.
 *
 * @returns {{ status: string, data: object[], error: object|null }}
 */
function useFilesData () {
  const dispatch = useDispatch()
  const selectedFile = useSelector(selectSelectedFile)
  const { status, data, error } = useSelector(selectFilesState)

  // El listado de archivos del filtro se pide una sola vez.
  useEffect(() => {
    dispatch(fetchFilesList())
  }, [dispatch])

  // Los datos se vuelven a pedir cada vez que cambia el archivo seleccionado.
  useEffect(() => {
    const promise = dispatch(fetchFilesData(selectedFile || undefined))

    // Si el usuario cambia de archivo antes de que termine la request previa,
    // se aborta para que una respuesta vieja no pise a la nueva.
    return () => promise.abort()
  }, [dispatch, selectedFile])

  return { status, data, error }
}

export default useFilesData
