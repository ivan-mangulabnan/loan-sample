import { useState } from 'react'
import Button from '../../../components/Button.jsx'
import Modal from '../../../components/Modal.jsx'
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
 * Confirms a disbursement. Not a DecisionModal with one button: there is no decision to
 * make here — the approver already made it — and the figures that matter are different
 * ones. What this has to show is the money leaving the ledger and the repayment it buys.
 *
 * `release` is a FundReleaseQueueResponse row, keyed on loanApprovalId.
 */
function ReleaseModal({ release, onSubmit, onClose, isSubmitting = false, error = null }) {
  const [remarks, setRemarks] = useState('')

  if (!release) return null

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
          <Button
            variant="accent"
            onClick={() => onSubmit({ remarks: remarks.trim() || undefined })}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Releasing…' : 'Release funds'}
          </Button>
        </>
      }
    >
      <p className="release__lead">
        This pays out to the borrower and draws down the operating ledger. It opens the
        loan — there is no undo in the API.
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
        <span className="release__hint">optional</span>
      </label>
      <textarea
        id="release-remarks"
        className="field field--input release__remarks"
        rows={3}
        value={remarks}
        placeholder="Reference, payout method, anything worth recording"
        onChange={(event) => setRemarks(event.target.value)}
      />

      {/* Two very different 409s land here: the application moved on, or the ledger will
          not cover the principal. The server's sentence distinguishes them. */}
      {error && (
        <p className="release__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}

export default ReleaseModal
