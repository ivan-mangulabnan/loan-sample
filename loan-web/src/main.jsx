import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './styles/index.css'
import { ToastProvider } from './components/ToastContext.jsx'
import { SessionProvider } from './features/auth/index.js'
import { router } from './router.jsx'

localStorage.removeItem('loan-web.token')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </SessionProvider>
  </StrictMode>,
)
