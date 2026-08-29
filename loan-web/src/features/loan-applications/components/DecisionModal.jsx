import { useRef, useState } from 'react'
import IconButton from '../../../components/IconButton.jsx'
import Modal from '../../../components/Modal.jsx'
import ApplicationStatusBadge from './ApplicationStatusBadge.jsx'
import ModalProgress from './ModalProgress.jsx'
import { useToast } from '../../../components/useToast.js'
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

  if (!application) return null

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
      open
      title={`${title} #${application.loanApplicationId}`}
      onClose={onClose}
      footer={
        decisions.map((decision) => (
          <IconButton
            key={decision}
            glyph={DECISION_GLYPHS[decision]}
            label={DECISION_LABELS[decision]}
            tone={toneFor(decision)}
            busy={isSubmitting && pending === decision}
            onClick={() => handle(decision)}
            disabled={isSubmitting}
          />
        ))
      }
    >
      <ModalProgress application={application} />

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
        ref={remarksRef}
        id="decision-remarks"
        className={`field field--input decision__remarks${
          missingRemarks ? ' decision__remarks--missing' : ''
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
