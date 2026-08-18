import Button from '../../../components/Button.jsx'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { ListView } from '../../dashboard/index.js'
import LoanTable from '../components/LoanTable.jsx'
import { useMyLoans } from '../hooks.js'
import { LOAN_STATUS_OPTIONS } from '../statusOptions.js'

/**
 * The borrower's own loans in full. The status dropdown is the loan lifecycle, a
 * different vocabulary from the application one — see statusOptions.js.
 */
export function LoanListPage() {
  const [query, onQueryChange] = useListQuery()
  const { data, error, isLoading, reload } = useMyLoans(query)

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

      <ListView
        query={query}
        onQueryChange={onQueryChange}
        items={data}
        isLoading={isLoading}
        error={error}
        emptyMessage="You have no loans yet."
        searchPlaceholder="Search by reference"
        searchLabel="Search my loans"
        statusOptions={LOAN_STATUS_OPTIONS}
      >
        {(rows) => <LoanTable rows={rows} />}
      </ListView>
    </>
  )
}

export default LoanListPage
