import { createBrowserRouter } from 'react-router-dom'
import AppLayout from './app/AppLayout.jsx'
import ErrorBoundary from './app/ErrorBoundary.jsx'
import HomePage from './app/HomePage.jsx'
import NotFound from './app/NotFound.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'applications',
        lazy: async () => {
          const { ApplicationListPage } = await import(
            './features/loan-applications/routes/ApplicationListPage.jsx'
          )
          return { Component: ApplicationListPage }
        },
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])
