import { useCallback, useState } from 'react'
import Button from '../../../components/Button.jsx'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { useWriteAction } from '../../../hooks/useWriteAction.js'
import { ListView, QueueTable } from '../../dashboard/index.js'
import ApplyModal from './ApplyModal.jsx'
import CancelModal from './CancelModal.jsx'
import ResubmitModal from './ResubmitModal.jsx'
import ViewApplicationModal from './ViewApplicationModal.jsx'
import { actionFor, BORROWER_ACTIONS } from '../actions.js'
import { cancelApplication, createApplication, resubmitApplication } from '../api.js'
import { useMyApplications } from '../hooks.js'
import { APPLICATION_STATUS_OPTIONS } from '../statusOptions.js'
import { RECORD_SORT_OPTIONS } from '../sortOptions.js'

function MyApplications() {
  const [query, onQueryChange] = useListQuery()
  const { data, error, isLoading, reload } = useMyApplications(query)

  const [viewing, setViewing] = useState(null)

  const send = useCallback((_target, payload) => createApplication(payload), [])
  const sendResubmit = useCallback(
    (application, payload) => resubmitApplication(application.loanApplicationId, payload),
    [],
  )
  const sendCancel = useCallback(
    (application) => cancelApplication(application.loanApplicationId),
    [],
  )

  const apply = useWriteAction(send, reload)
  const resubmit = useWriteAction(sendResubmit, reload)
  const cancel = useWriteAction(sendCancel, reload)

  const openFor = (row) =>
    (actionFor(row) === BORROWER_ACTIONS.Resubmit ? resubmit : cancel).open(row)

  const view = (row) => setViewing(row)

  const actFromViewer = (application) => {
    setViewing(null)
    openFor(application)
  }

  const cancelInstead = (application) => {
    resubmit.close()
    cancel.open(application)
  }

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

      <ListView
        skeletonColumns={6}
        query={query}
        onQueryChange={onQueryChange}
        items={data}
        isLoading={isLoading}
        error={error}
        emptyMessage="You have not applied for a loan yet."
        searchPlaceholder="Search by reference"
        searchLabel="Search my applications"
        statusOptions={APPLICATION_STATUS_OPTIONS}
        sortOptions={RECORD_SORT_OPTIONS}
      >
        {(rows) => (
          <QueueTable
            shape="application"
            rows={rows}
            hideBorrower
            actionLabel={actionFor}
            onAction={openFor}
            onRowOpen={view}
          />
        )}
      </ListView>

      {/* Rendered unconditionally and told whether it is open: gating the element
          itself unmounts it before it can play its exit. */}
      <ApplyModal
        open={Boolean(apply.target)}
        onSubmit={apply.run}
        onClose={apply.close}
        isSubmitting={apply.isSubmitting}
        error={apply.error}
      />

      <ResubmitModal
        application={resubmit.target}
        onSubmit={resubmit.run}
        onCancelInstead={cancelInstead}
        onClose={resubmit.close}
        isSubmitting={resubmit.isSubmitting}
        error={resubmit.error}
      />

      <CancelModal
        application={cancel.target}
        onSubmit={cancel.run}
        onClose={cancel.close}
        isSubmitting={cancel.isSubmitting}
        error={cancel.error}
      />

      <ViewApplicationModal
        application={viewing}
        onClose={() => setViewing(null)}
        onAct={actFromViewer}
      />
    </>
  )
}

export default MyApplications
