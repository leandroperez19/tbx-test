'use strict'

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getFilesData, getFilesList } from '../services/filesService'

/**
 * Convierte el resultado discriminado de la capa de servicios en el resultado
 * que espera un thunk de Redux Toolkit.
 *
 * Los servicios devuelven `{ status, data | error }` en lugar de lanzar. RTK,
 * en cambio, distingue `fulfilled` de `rejected` por el rechazo de la promesa,
 * así que el error se traslada con `rejectWithValue`.
 *
 * @param {object} result Resultado devuelto por la capa de servicios.
 * @param {Function} rejectWithValue Helper de RTK.
 */
function unwrapResult (result, rejectWithValue) {
  return result.status === 'success'
    ? result.data
    : rejectWithValue(result.error)
}

export const fetchFilesData = createAsyncThunk(
  'files/fetchData',
  async (fileName, { rejectWithValue }) => {
    const result = await getFilesData({ fileName })

    return unwrapResult(result, rejectWithValue)
  }
)

export const fetchFilesList = createAsyncThunk(
  'files/fetchList',
  async (_, { rejectWithValue }) => {
    const result = await getFilesList()

    return unwrapResult(result, rejectWithValue)
  }
)

const initialState = {
  /** 'loading' | 'success' | 'error' */
  status: 'loading',
  data: [],
  error: null,
  /** Nombre del archivo seleccionado en el filtro; cadena vacía = todos. */
  selectedFile: '',
  /** Listado de archivos disponibles para el filtro. */
  availableFiles: []
}

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    fileSelected (state, action) {
      state.selectedFile = action.payload
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchFilesData.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchFilesData.fulfilled, (state, action) => {
        state.status = 'success'
        state.data = action.payload
      })
      .addCase(fetchFilesData.rejected, (state, action) => {
        state.status = 'error'
        state.data = []
        state.error = action.payload
      })
      // El listado alimenta únicamente el filtro: si falla, el resto de la
      // pantalla sigue siendo utilizable, por lo que no altera `status`.
      .addCase(fetchFilesList.fulfilled, (state, action) => {
        state.availableFiles = action.payload
      })
  }
})

export const { fileSelected } = filesSlice.actions

export const selectFilesState = state => state.files
export const selectSelectedFile = state => state.files.selectedFile
export const selectAvailableFiles = state => state.files.availableFiles

export default filesSlice.reducer
