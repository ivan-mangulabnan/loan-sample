import { useState } from 'react'
import Button from '../../../components/Button.jsx'
import Modal from '../../../components/Modal.jsx'
import ApplicationStatusBadge from './ApplicationStatusBadge.jsx'
import { DECISION_LABELS, DECISIONS, REQUIRES_REMARKS } from '../decisions.js'
import './DecisionModal.css'

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
 * The decision dialog behind both staff queues. Review and approval differ only in which
 * decisions they offer and where the caller posts, so `decisions` is a prop rather than
 * two near-identical components (rule 3).
 *
 * It restates the row's figures because the row is behind a backdrop by the time this is
 * open — deciding on an amount you can no longer see is how the wrong loan gets approved.
 *
 * The caller owns the request. This reports *what* the reader chose and renders whatever
 * came back; it does not know which endpoint it feeds (rule 4).
 */
function DecisionModal({
  application,
  decisions,
  title = 'Decision',
  onSubmit,
  onClose,
  isSubmitting = false,
  error = null,
}) {
  const [remarks, setRemarks] = useState('')
  // Which button was pressed, so only that one shows the pending label — three buttons
  // all reading "Working…" would not say which decision is in flight.
  const [pending, setPending] = useState(null)
  const [missingRemarks, setMissingRemarks] = useState(false)

  if (!application) return null

  function handle(decision) {
    if (REQUIRES_REMARKS.includes(decision) && !remarks.trim()) {
      setMissingRemarks(true)
      return
    }

    setMissingRemarks(false)
    setPending(decision)
    // Always sends `decision`. An omitted key is not an empty decision to the API — it
    // is an Approve (see decisions.js).
    onSubmit({ decision, remarks: remarks.trim() || undefined })
  }

  return (
    <Modal
      open
      title={`${title} #${application.loanApplicationId}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          {decisions.map((decision) => (
            <Button
              key={decision}
              variant={decision === DECISIONS.Approve ? 'accent' : 'default'}
              onClick={() => handle(decision)}
              disabled={isSubmitting}
            >
              {isSubmitting && pending === decision
                ? 'Working…'
                : DECISION_LABELS[decision]}
            </Button>
          ))}
        </>
      }
    >
      <dl className="decision__facts">
        {application.borrower && (
          <div className="decision__fact">
            <dt>Borrower</dt>
            <dd>{application.borrower}</dd>
          </div>
        )}
        <div className="decision__fact">
          <dt>Amount</dt>
          <dd className="decision__amount">{currency.format(application.amount)}</dd>
        </div>
        <div className="decision__fact">
          <dt>Plan</dt>
          <dd>
            {application.paymentPlan?.name ?? '—'}
            {application.paymentPlan &&
              ` · ${application.paymentPlan.numberOfMonths} months · ${application.paymentPlan.interestRate}%`}
          </dd>
        </div>
        <div className="decision__fact">
          <dt>Requested</dt>
          <dd>{date.format(new Date(application.dateRequested))}</dd>
        </div>
        <div className="decision__fact">
          <dt>Status</dt>
          <dd>
            <ApplicationStatusBadge status={application.status} />
          </dd>
        </div>
      </dl>

      <label className="decision__label" htmlFor="decision-remarks">
        Remarks
        <span className="decision__hint">
          required to reject{decisions.includes(DECISIONS.Return) ? ' or return' : ''}
        </span>
      </label>
      <textarea
        id="decision-remarks"
        className="field field--input decision__remarks"
        rows={4}
        value={remarks}
        placeholder="What should the borrower or the next desk know?"
        onChange={(event) => {
          setRemarks(event.target.value)
          if (missingRemarks) setMissingRemarks(false)
        }}
      />

      {missingRemarks && (
        <p className="decision__error" role="alert">
          Add remarks before rejecting or returning — the API requires them, and they are
          the only explanation the borrower gets.
        </p>
      )}

      {/* The server's own sentence. It names the rule that was broken, which is more
          than the client can work out from a 409 alone. */}
      {error && (
        <p className="decision__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}

export default DecisionModal
