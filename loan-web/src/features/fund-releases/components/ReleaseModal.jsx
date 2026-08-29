import { useCallback, useRef, useState } from 'react'
import IconButton from '../../../components/IconButton.jsx'
import Modal from '../../../components/Modal.jsx'
import { useToast } from '../../../components/useToast.js'
import { useClosingProp, useClosingValue, useResetOnOpen } from '../../../hooks/useClosingValue.js'
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

function ReleaseModal({
  release,
  balance,
  releaseBlocked = false,
  onSubmit,
  onClose,
  isSubmitting = false,
  error = null,
}) {
  const [remarks, setRemarks] = useState('')
  const [pending, setPending] = useState(null)
  const [missingRemarks, setMissingRemarks] = useState(false)

  const remarksRef = useRef(null)

  const toast = useToast()

  // Held through the exit so the dialog still has something to render while it
  // animates out — see useClosingValue.
  const shown = useClosingValue(release)

  // Held so the footer does not flip back to its idle labels while the dialog
  // fades: a successful write clears the target and resets these together.
  const busy = useClosingProp(isSubmitting, Boolean(release))
  const busyOn = useClosingProp(pending, Boolean(release))

  // Replaces the `key` the page used to set — see DecisionModal. Fires on every
  // open, not only on a new row.
  useResetOnOpen(
    Boolean(release),
    useCallback(() => {
      setRemarks('')
      setPending(null)
      setMissingRemarks(false)
    }, []),
  )

  if (!shown) return null

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
      open={Boolean(release)}
      title={`Release funds · #${shown.application.loanApplicationId}`}
      onClose={onClose}
      footer={
        <>
          <IconButton
            glyph={DECISION_GLYPHS[DECISIONS.Reject]}
            label="Reject"
            tone="danger"
            busy={busy && busyOn === DECISIONS.Reject}
            onClick={() => handle(DECISIONS.Reject)}
            disabled={busy}
          />
          {/* Rejecting moves no money, so it stays enabled while the ledger is short —
              only the payout is blocked. Uses the native title tooltip rather than
              IconButton's hover label, which is positioned for the button row. */}
          <IconButton
            glyph={DECISION_GLYPHS[DECISIONS.Approve]}
            label="Release funds"
            tone="accent"
            busy={busy && busyOn === DECISIONS.Approve}
            onClick={() => handle(DECISIONS.Approve)}
            disabled={busy || releaseBlocked}
            title={
              releaseBlocked
                ? `Capital on hand is ${currency.format(balance)} — not enough to release ${currency.format(shown.principalAmount)}.`
                : undefined
            }
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
          <dd className="release__amount">
            {currency.format(shown.principalAmount)}
            {/* Sits inside the existing fact row rather than as its own block: the
                modal body is overflow-y: auto and already dense, so a new block is
                what would put a scrollbar in it. */}
            {releaseBlocked && (
              <span className="release__short">
                Capital on hand is only {currency.format(balance)}
              </span>
            )}
          </dd>
        </div>
        <div className="release__fact">
          <dt>Borrower</dt>
          <dd>{shown.application.borrower ?? '—'}</dd>
        </div>
        <div className="release__fact">
          <dt>Term</dt>
          <dd>
            {shown.numberOfMonths} months · {shown.interestRate}%
          </dd>
        </div>
        <div className="release__fact">
          <dt>Repayment</dt>
          <dd>{currency.format(shown.totalRepaymentAmount)}</dd>
        </div>
        <div className="release__fact">
          <dt>Approved</dt>
          <dd>
            {date.format(new Date(shown.approvalDate))} by {shown.approver}
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
          missingRemarks ? ' field--invalid' : ''
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
