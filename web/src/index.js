'use strict'

import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store'
import App from './App'
import ErrorBoundary from './components/errorBoundary'

import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'

const container = document.getElementById('root')

createRoot(container).render(
  <ErrorBoundary>
    <Provider store={store}>
      <App />
    </Provider>
  </ErrorBoundary>
)