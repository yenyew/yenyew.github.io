import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import MobileOnly from './components/MobileOnly.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <MobileOnly>
        <App />
      </MobileOnly>
    </BrowserRouter>
  </StrictMode>,
)