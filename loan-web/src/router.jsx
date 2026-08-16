import { createBrowserRouter } from 'react-router-dom'
import AppLayout from './app/AppLayout.jsx'
import ErrorBoundary from './app/ErrorBoundary.jsx'
import NotFound from './app/NotFound.jsx'
import { RequireRole } from './features/auth/index.js'
import { ROLES } from './lib/roles.js'

const queueRoute = () => ({
  lazy: async () => {
    const { QueuePage } = await import(
      './features/dashboard/routes/QueuePage.jsx'
    )
    return { Component: QueuePage }
  },
})

export const router = createBrowserRouter([
  {
    path: '/login',
    lazy: async () => {
      const { LoginPage } = await import(
        './features/auth/routes/LoginPage.jsx'
      )
      return { Component: LoginPage }
    },
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/',
    element: (
      <RequireRole>
        <AppLayout />
      </RequireRole>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { DashboardPage } = await import(
            './features/dashboard/routes/DashboardPage.jsx'
          )
          return { Component: DashboardPage }
        },
      },
      {
        path: 'review',
        element: <RequireRole allow={[ROLES.Reviewer]} />,
        children: [{ index: true, ...queueRoute() }],
      },
      {
        path: 'approvals',
        element: <RequireRole allow={[ROLES.Approver]} />,
        children: [{ index: true, ...queueRoute() }],
      },
      {
        path: 'releases',
        element: <RequireRole allow={[ROLES.Admin]} />,
        children: [{ index: true, ...queueRoute() }],
      },
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
