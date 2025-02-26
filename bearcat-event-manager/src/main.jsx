import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { EventProvider } from './context/eventContext.jsx'

createRoot(document.getElementById('root')).render(
  <>
    <EventProvider>
      <App />
    </EventProvider>
  </>
)
