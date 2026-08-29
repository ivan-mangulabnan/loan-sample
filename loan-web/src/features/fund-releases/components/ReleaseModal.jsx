import { useRef, useState } from 'react'
import IconButton from '../../../components/IconButton.jsx'
import Modal from '../../../components/Modal.jsx'
import { useToast } from '../../../components/useToast.js'
import {
  DECISION_GLYPHS,
  DECISIONS,
  ModalProgress,
  REQUIRES_REMARKS,
} from '../../loan-applications/index.js'
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

function ReleaseModal({ release, onSubmit, onClose, isSubmitting = false, error = null }) {
  const [remarks, setRemarks] = useState('')
  const [pending, setPending] = useState(null)
  const [missingRemarks, setMissingRemarks] = useState(false)

  const remarksRef = useRef(null)

  const toast = useToast()

  if (!release) return null

  function handle(decision) {
    if (REQUIRES_REMARKS.includes(decision) && !remarks.trim()) {
      setMissingRemarks(true)
      remarksRef.current?.focus()
      toast.push({
        message: 'Release not rejected — remarks are required.',
        tone: 'danger',
      })
      return
    }

    setMissingRemarks(false)
    setPending(decision)
    onSubmit({ decision, remarks: remarks.trim() || undefined })
  }

  return (
    <Modal
      open
      title={`Release funds · #${release.application.loanApplicationId}`}
      onClose={onClose}
      footer={
        <>
          <IconButton
            glyph={DECISION_GLYPHS[DECISIONS.Reject]}
            label="Reject"
            tone="danger"
            busy={isSubmitting && pending === DECISIONS.Reject}
            onClick={() => handle(DECISIONS.Reject)}
            disabled={isSubmitting}
          />
          <IconButton
            glyph={DECISION_GLYPHS[DECISIONS.Approve]}
            label="Release funds"
            tone="accent"
            busy={isSubmitting && pending === DECISIONS.Approve}
            onClick={() => handle(DECISIONS.Approve)}
            disabled={isSubmitting}
          />
        </>
      }
    >
      <ModalProgress code="PENDING_RELEASE" />

      <p className="release__lead">
        Releasing pays out to the borrower and draws down the operating ledger. It opens
        the loan and cannot be undone. Rejecting closes the application for good and
        moves no money.
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
        ref={remarksRef}
        id="release-remarks"
        className={`field field--input release__remarks${
          missingRemarks ? ' release__remarks--missing' : ''
        }`}
        rows={3}
        value={remarks}
        placeholder="Reference, payout method, or why this is not being funded"
        aria-invalid={missingRemarks || undefined}
        onChange={(event) => {
          setRemarks(event.target.value)
          if (missingRemarks) setMissingRemarks(false)
        }}
      />

      {error && (
        <p className="release__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}

export default ReleaseModal
