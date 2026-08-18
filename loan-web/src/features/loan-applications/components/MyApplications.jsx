import Button from '../../../components/Button.jsx'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { ListView, QueueTable } from '../../dashboard/index.js'
import { useMyApplications } from '../hooks.js'
import { APPLICATION_STATUS_OPTIONS } from '../statusOptions.js'

/** The signed-in borrower's own applications. */
function MyApplications() {
  const [query, onQueryChange] = useListQuery()
  const { data, error, isLoading, reload } = useMyApplications(query)

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="heading">My applications</h1>
          <p className="muted">Everything you have applied for</p>
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
        emptyMessage="You have not applied for a loan yet."
        searchPlaceholder="Search by reference"
        searchLabel="Search my applications"
        statusOptions={APPLICATION_STATUS_OPTIONS}
      >
        {/* hideBorrower: the endpoint does not include it, and it is the reader. */}
        {(rows) => <QueueTable shape="application" rows={rows} hideBorrower />}
      </ListView>
    </>
  )
}

export default MyApplications
