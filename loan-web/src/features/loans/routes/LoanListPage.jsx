import Button from '../../../components/Button.jsx'
import LoanTable from '../components/LoanTable.jsx'
import { useMyLoans } from '../hooks.js'

/** The borrower's own loans in full. */
export function LoanListPage() {
  const { data, error, isLoading, reload } = useMyLoans()
  const rows = data ?? []

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="heading">My loans</h1>
          <p className="muted">Balances and repayment progress</p>
        </div>
        <Button size="sm" onClick={reload}>
          Refresh
        </Button>
      </header>

      {error ? (
        <p className="muted">Could not load: {error.message}</p>
      ) : isLoading ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="muted">You have no loans yet.</p>
      ) : (
        <LoanTable rows={rows} />
      )}
    </>
  )
}

export default LoanListPage
