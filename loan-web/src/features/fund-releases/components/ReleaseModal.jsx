import { useState } from 'react'
import Button from '../../../components/Button.jsx'
import Modal from '../../../components/Modal.jsx'
import { DECISIONS, REQUIRES_REMARKS } from '../../loan-applications/index.js'
import './ReleaseModal.css'

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
 * The last desk's decision: fund it, or refuse.
 *
 * Not a DecisionModal — the row is a FundReleaseQueueResponse rather than an
 * application, and the figures that matter here are the approval's, not the ones the
 * borrower asked for. It also has to say what pressing the accent button costs, which no
 * other decision on the system does.
 *
 * The decision vocabulary is shared, though: Approve means release. That reads oddly and
 * the button says so — but the wire value has to be one the C# enum knows, and inventing
 * a fourth member for one desk would leave two spellings of the same idea.
 *
 * `release` is a FundReleaseQueueResponse row, keyed on loanApprovalId.
 */
function ReleaseModal({ release, onSubmit, onClose, isSubmitting = false, error = null }) {
  const [remarks, setRemarks] = useState('')
  // Which button was pressed, so only that one shows the pending label — both reading
  // "Working…" would not say whether money is moving.
  const [pending, setPending] = useState(null)
  const [missingRemarks, setMissingRemarks] = useState(false)

  if (!release) return null

  function handle(decision) {
    if (REQUIRES_REMARKS.includes(decision) && !remarks.trim()) {
      setMissingRemarks(true)
      return
    }

    setMissingRemarks(false)
    setPending(decision)
    // Always sends `decision`. The API declares it nullable so an omission is a 400
    // rather than a silent release, but nothing here relies on that.
    onSubmit({ decision, remarks: remarks.trim() || undefined })
  }

  return (
    <Modal
      open
      title={`Release funds · #${release.application.loanApplicationId}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={() => handle(DECISIONS.Reject)} disabled={isSubmitting}>
            {isSubmitting && pending === DECISIONS.Reject ? 'Working…' : 'Reject'}
          </Button>
          <Button
            variant="accent"
            onClick={() => handle(DECISIONS.Approve)}
            disabled={isSubmitting}
          >
            {isSubmitting && pending === DECISIONS.Approve
              ? 'Releasing…'
              : 'Release funds'}
          </Button>
        </>
      }
    >
      <p className="release__lead">
        Releasing pays out to the borrower and draws down the operating ledger. It opens
        the loan — there is no undo in the API. Rejecting closes the application for good
        and moves no money.
      </p>

      <dl className="release__facts">
        <div className="release__fact release__fact--lead">
          <dt>Principal</dt>
          <dd className="release__amount">{currency.format(release.principalAmount)}</dd>
        </div>
        <div className="release__fact">
          <dt>Borrower</dt>
          <dd>{release.application.borrower ?? '—'}</dd>
        </div>
        <div className="release__fact">
          <dt>Term</dt>
          <dd>
            {release.numberOfMonths} months · {release.interestRate}%
          </dd>
        </div>
        <div className="release__fact">
          <dt>Repayment</dt>
          <dd>{currency.format(release.totalRepaymentAmount)}</dd>
        </div>
        <div className="release__fact">
          <dt>Approved</dt>
          <dd>
            {date.format(new Date(release.approvalDate))} by {release.approver}
          </dd>
        </div>
      </dl>

      <label className="release__label" htmlFor="release-remarks">
        Remarks
        <span className="release__hint">required to reject</span>
      </label>
      <textarea
        id="release-remarks"
        className="field field--input release__remarks"
        rows={3}
        value={remarks}
        placeholder="Reference, payout method, or why this is not being funded"
        onChange={(event) => {
          setRemarks(event.target.value)
          if (missingRemarks) setMissingRemarks(false)
        }}
      />

      {missingRemarks && (
        <p className="release__error" role="alert">
          Add remarks before rejecting — the API requires them, and they are the only
          explanation the borrower gets for a refused release.
        </p>
      )}

      {/* Three different 409s land here: the application moved on, the ledger will not
          cover the principal, or a rejection arrived without remarks. The server's
          sentence distinguishes them. */}
      {error && (
        <p className="release__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}

export default ReleaseModal
