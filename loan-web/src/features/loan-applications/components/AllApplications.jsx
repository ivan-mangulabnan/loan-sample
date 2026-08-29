import { useState } from 'react'
import Button from '../../../components/Button.jsx'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { ListView, QueueTable } from '../../dashboard/index.js'
import ViewApplicationModal from './ViewApplicationModal.jsx'
import { useAllApplications } from '../hooks.js'
import { APPLICATION_STATUS_OPTIONS } from '../statusOptions.js'
import { RECORD_SORT_OPTIONS } from '../sortOptions.js'

function AllApplications() {
  const [query, onQueryChange] = useListQuery()
  const { data, error, isLoading, reload } = useAllApplications(query)
  const [viewing, setViewing] = useState(null)

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="heading">All applications</h1>
          <p className="muted">Every application in your tenancy, any status</p>
        </div>
        <Button size="sm" onClick={reload}>
          Refresh
        </Button>
      </header>

      <ListView
        skeletonColumns={6}
        query={query}
        onQueryChange={onQueryChange}
        items={data}
        isLoading={isLoading}
        error={error}
        emptyMessage="No applications have been submitted yet."
        searchPlaceholder="Search by reference or borrower name"
        searchLabel="Search applications"
        statusOptions={APPLICATION_STATUS_OPTIONS}
        sortOptions={RECORD_SORT_OPTIONS}
      >
        {(rows) => (
          <QueueTable shape="application" rows={rows} onRowOpen={setViewing} />
        )}
      </ListView>

      <ViewApplicationModal
        application={viewing}
        onClose={() => setViewing(null)}
      />
    </>
  )
}

export default AllApplications
