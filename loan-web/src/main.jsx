import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './styles/index.css'
import { SessionProvider } from './features/auth/index.js'
import { router } from './router.jsx'

// One-time cleanup: the JWT used to be kept here before it moved into an HttpOnly
// cookie. Without this a stale token sits in browser storage indefinitely.
localStorage.removeItem('loan-web.token')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  </StrictMode>,
)
