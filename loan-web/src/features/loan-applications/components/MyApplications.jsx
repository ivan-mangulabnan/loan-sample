import { useCallback } from 'react'
import Button from '../../../components/Button.jsx'
import Callout from '../../../components/Callout.jsx'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { useWriteAction } from '../../../hooks/useWriteAction.js'
import { ListView, QueueTable } from '../../dashboard/index.js'
import ApplyModal from './ApplyModal.jsx'
import { createApplication } from '../api.js'
import { useMyApplications } from '../hooks.js'
import { APPLICATION_STATUS_OPTIONS } from '../statusOptions.js'

/** The signed-in borrower's own applications, and the form to add one. */
function MyApplications() {
  const [query, onQueryChange] = useListQuery()
  const { data, error, isLoading, reload } = useMyApplications(query)

  // No target: applying is not an action on a row, so the modal opens on a sentinel
  // rather than on a record. `true` is enough for useWriteAction to consider it open.
  const send = useCallback((_target, payload) => createApplication(payload), [])

  const apply = useWriteAction(send, reload)

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="heading">My applications</h1>
          <p className="muted">Everything you have applied for</p>
        </div>
        <div className="page-head__actions">
          <Button size="sm" onClick={reload}>
            Refresh
          </Button>
          <Button variant="accent" size="sm" onClick={() => apply.open(true)}>
            Apply for a loan
          </Button>
        </div>
      </header>

      {apply.notice && <Callout onDismiss={apply.dismissNotice}>{apply.notice}</Callout>}

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

      {apply.target && (
        <ApplyModal
          onSubmit={apply.run}
          onClose={apply.close}
          isSubmitting={apply.isSubmitting}
          error={apply.error}
        />
      )}
    </>
  )
}

export default MyApplications
