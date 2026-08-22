import { createBrowserRouter } from 'react-router-dom'
import AppLayout from './app/AppLayout.jsx'
import ErrorBoundary from './app/ErrorBoundary.jsx'
import NotFound from './app/NotFound.jsx'
import { RequireRole } from './features/auth/index.js'
import { ROLES } from './lib/roles.js'

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
    path: '/register',
    lazy: async () => {
      const { RegisterPage } = await import(
        './features/auth/routes/RegisterPage.jsx'
      )
      return { Component: RegisterPage }
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
      // Both audiences reach this one, so it carries no role gate — the page
      // renders the borrower or the staff view, and the API enforces the rest.
      {
        path: 'applications',
        lazy: async () => {
          const { ApplicationsPage } = await import(
            './features/loan-applications/routes/ApplicationsPage.jsx'
          )
          return { Component: ApplicationsPage }
        },
      },
      {
        path: 'loans',
        element: <RequireRole allow={[ROLES.Loaner]} />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { LoanListPage } = await import(
                './features/loans/routes/LoanListPage.jsx'
              )
              return { Component: LoanListPage }
            },
          },
          // Sibling of the index, not a child of it: the table unmounts and the
          // detail takes its place, so Back restores the list rather than nesting
          // one inside the other.
          {
            path: ':id',
            lazy: async () => {
              const { LoanDetailPage } = await import(
                './features/loans/routes/LoanDetailPage.jsx'
              )
              return { Component: LoanDetailPage }
            },
          },
        ],
      },
      {
        path: 'review',
        element: <RequireRole allow={[ROLES.Reviewer]} />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { ReviewPage } = await import(
                './features/review/routes/ReviewPage.jsx'
              )
              return { Component: ReviewPage }
            },
          },
        ],
      },
      {
        path: 'approvals',
        element: <RequireRole allow={[ROLES.Approver]} />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { ApprovalsPage } = await import(
                './features/approvals/routes/ApprovalsPage.jsx'
              )
              return { Component: ApprovalsPage }
            },
          },
        ],
      },
      {
        path: 'releases',
        element: <RequireRole allow={[ROLES.Admin]} />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { FundReleasesPage } = await import(
                './features/fund-releases/routes/FundReleasesPage.jsx'
              )
              return { Component: FundReleasesPage }
            },
          },
        ],
      },
      {
        path: 'ledger',
        element: <RequireRole allow={[ROLES.Admin]} />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { LedgerPage } = await import(
                './features/ledger/routes/LedgerPage.jsx'
              )
              return { Component: LedgerPage }
            },
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])
