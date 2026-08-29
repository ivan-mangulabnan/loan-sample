import { useCallback, useRef, useState } from 'react'
import IconButton from '../../../components/IconButton.jsx'
import Modal from '../../../components/Modal.jsx'
import ApplicationStatusBadge from './ApplicationStatusBadge.jsx'
import ModalProgress from './ModalProgress.jsx'
import { useToast } from '../../../components/useToast.js'
import { useClosingProp, useClosingValue, useResetOnOpen } from '../../../hooks/useClosingValue.js'
import {
  DECISION_GLYPHS,
  DECISION_LABELS,
  DECISION_OUTCOMES,
  DECISIONS,
  REQUIRES_REMARKS,
} from '../decisions.js'
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

const toneFor = (decision) =>
  decision === DECISIONS.Approve ? 'accent' : decision === DECISIONS.Reject ? 'danger' : 'default'

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
  const [pending, setPending] = useState(null)
  const [missingRemarks, setMissingRemarks] = useState(false)

  const remarksRef = useRef(null)

  const toast = useToast()

  // Held through the exit so the dialog still has something to render while it
  // animates out — see useClosingValue.
  const shown = useClosingValue(application)

  // Held so the footer does not flip back to its idle labels while the dialog
  // fades: a successful write clears the target and resets these together.
  const busy = useClosingProp(isSubmitting, Boolean(application))
  const busyOn = useClosingProp(pending, Boolean(application))

  // Replaces the `key` the pages used to set: clear the form on every open, so the
  // previous remarks never carry over — not even when it is the same application.
  useResetOnOpen(
    Boolean(application),
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
        message: `Application not ${DECISION_OUTCOMES[decision]} — remarks are required.`,
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
      open={Boolean(application)}
      title={`${title} #${shown.loanApplicationId}`}
      onClose={onClose}
      footer={
        decisions.map((decision) => (
          <IconButton
            key={decision}
            glyph={DECISION_GLYPHS[decision]}
            label={DECISION_LABELS[decision]}
            tone={toneFor(decision)}
            busy={busy && busyOn === decision}
            onClick={() => handle(decision)}
            disabled={busy}
          />
        ))
      }
    >
      <ModalProgress application={shown} />

      <dl className="decision__facts">
        {shown.borrower && (
          <div className="decision__fact">
            <dt>Borrower</dt>
            <dd>{shown.borrower}</dd>
          </div>
        )}
        <div className="decision__fact">
          <dt>Amount</dt>
          <dd className="decision__amount">{currency.format(shown.amount)}</dd>
        </div>
        <div className="decision__fact">
          <dt>Plan</dt>
          <dd>
            {shown.paymentPlan?.name ?? '—'}
            {shown.paymentPlan &&
              ` · ${shown.paymentPlan.numberOfMonths} months · ${shown.paymentPlan.interestRate}%`}
          </dd>
        </div>
        <div className="decision__fact">
          <dt>Requested</dt>
          <dd>{date.format(new Date(shown.dateRequested))}</dd>
        </div>
        <div className="decision__fact">
          <dt>Status</dt>
          <dd>
            <ApplicationStatusBadge status={shown.status} />
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
        ref={remarksRef}
        id="decision-remarks"
        className={`field field--input decision__remarks${
          missingRemarks ? ' field--invalid' : ''
        }`}
        rows={4}
        value={remarks}
        placeholder="What should the borrower or the next desk know?"
        aria-invalid={missingRemarks || undefined}
        onChange={(event) => {
          setRemarks(event.target.value)
          if (missingRemarks) setMissingRemarks(false)
        }}
      />

      {error && (
        <p className="decision__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}

export default DecisionModal
