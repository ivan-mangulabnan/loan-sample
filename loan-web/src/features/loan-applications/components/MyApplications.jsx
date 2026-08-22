import { useCallback } from 'react'
import Button from '../../../components/Button.jsx'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { useWriteAction } from '../../../hooks/useWriteAction.js'
import { ListView, QueueTable } from '../../dashboard/index.js'
import ApplyModal from './ApplyModal.jsx'
import CancelModal from './CancelModal.jsx'
import ResubmitModal from './ResubmitModal.jsx'
import { actionFor, BORROWER_ACTIONS } from '../actions.js'
import { cancelApplication, createApplication, resubmitApplication } from '../api.js'
import { useMyApplications } from '../hooks.js'
import { APPLICATION_STATUS_OPTIONS } from '../statusOptions.js'

/**
 * The signed-in borrower's own applications, and everything they can do to one.
 *
 * Three writes, three useWriteAction instances. One hook holds one target and one
 * in-flight request, and these post to three different endpoints with three different
 * bodies — sharing an instance would mean a single `isSubmitting` covering all of them.
 */
function MyApplications() {
  const [query, onQueryChange] = useListQuery()
  const { data, error, isLoading, reload } = useMyApplications(query)

  // No target: applying is not an action on a row, so the modal opens on a sentinel
  // rather than on a record. `true` is enough for useWriteAction to consider it open.
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

  // One button per row, so the row's status decides which write it belongs to. A
  // returned application is both resubmittable and cancellable and offers Resubmit —
  // ResubmitModal carries the other way out, next to the remarks that should decide it.
  const openFor = (row) =>
    (actionFor(row) === BORROWER_ACTIONS.Resubmit ? resubmit : cancel).open(row)

  // Swap one dialog for the other rather than stacking two <dialog>s. close() refuses
  // mid-flight, so this cannot fire while a resubmission is in the air.
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
        {/* hideBorrower: the endpoint does not include it, and it is the reader.
            actionLabel is a function here because this list spans all eight statuses
            and most rows are not actionable (rule 19b). */}
        {(rows) => (
          <QueueTable
            shape="application"
            rows={rows}
            hideBorrower
            actionLabel={actionFor}
            onAction={openFor}
          />
        )}
      </ListView>

      {apply.target && (
        <ApplyModal
          onSubmit={apply.run}
          onClose={apply.close}
          isSubmitting={apply.isSubmitting}
          error={apply.error}
        />
      )}

      {/* Keyed on the row so the prefilled amount and plan cannot leak between
          applications — the modal seeds its state once, on mount. */}
      {resubmit.target && (
        <ResubmitModal
          key={resubmit.target.loanApplicationId}
          application={resubmit.target}
          onSubmit={resubmit.run}
          onCancelInstead={cancelInstead}
          onClose={resubmit.close}
          isSubmitting={resubmit.isSubmitting}
          error={resubmit.error}
        />
      )}

      {cancel.target && (
        <CancelModal
          application={cancel.target}
          onSubmit={cancel.run}
          onClose={cancel.close}
          isSubmitting={cancel.isSubmitting}
          error={cancel.error}
        />
      )}
    </>
  )
}

export default MyApplications
