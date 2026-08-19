import Button from '../../../components/Button.jsx'
import Modal from '../../../components/Modal.jsx'
import ApplicationStatusBadge from './ApplicationStatusBadge.jsx'
import './CancelModal.css'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

const date = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/**
 * Confirms withdrawing an application.
 *
 * A confirm rather than a form: there is nothing to fill in, and CANCELLED is terminal
 * with no undo in the API. It restates the figures for the same reason DecisionModal
 * does — by the time this is open the row is behind a backdrop, and "cancel #12" means
 * nothing if you can no longer see what #12 was.
 *
 * Reached two ways: the Cancel action on a pending row, and the "Cancel application"
 * button inside ResubmitModal. The page swaps one dialog for the other rather than
 * stacking them.
 */
function CancelModal({ application, onSubmit, onClose, isSubmitting = false, error = null }) {
  if (!application) return null

  return (
    <Modal
      open
      title={`Cancel application #${application.loanApplicationId}`}
      onClose={onClose}
      footer={
        <>
          {/* "Keep it" rather than "Cancel": on a dialog about cancelling, a Cancel
              button is ambiguous in exactly the wrong direction. */}
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Keep it
          </Button>
          <Button variant="accent" onClick={() => onSubmit({})} disabled={isSubmitting}>
            {isSubmitting ? 'Cancelling…' : 'Yes, cancel it'}
          </Button>
        </>
      }
    >
      <p className="cancelapp__lead">
        This withdraws the application for good. It cannot be reopened — applying again
        starts a new one at the back of the queue.
      </p>

      <dl className="cancelapp__facts">
        <div className="cancelapp__fact">
          <dt>Amount</dt>
          <dd className="cancelapp__amount">{currency.format(application.amount)}</dd>
        </div>
        <div className="cancelapp__fact">
          <dt>Plan</dt>
          <dd>{application.paymentPlan?.name ?? '—'}</dd>
        </div>
        <div className="cancelapp__fact">
          <dt>Requested</dt>
          <dd>{date.format(new Date(application.dateRequested))}</dd>
        </div>
        <div className="cancelapp__fact">
          <dt>Status</dt>
          <dd>
            <ApplicationStatusBadge status={application.status} />
          </dd>
        </div>
      </dl>

      {/* The 409 to expect: it reached PENDING_RELEASE while this was open, at which
          point pulling out is no longer the borrower's call. */}
      {error && (
        <p className="cancelapp__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}

export default CancelModal
