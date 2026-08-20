'use strict'

import { createRoot } from 'react-dom/client'
import App from './app'

import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'

const container = document.getElementById('root')

createRoot(container).render(<App />)