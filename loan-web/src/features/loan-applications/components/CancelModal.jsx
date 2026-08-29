import IconButton from '../../../components/IconButton.jsx'
import Modal from '../../../components/Modal.jsx'
import { useClosingProp, useClosingValue } from '../../../hooks/useClosingValue.js'
import ApplicationStatusBadge from './ApplicationStatusBadge.jsx'
import ModalProgress from './ModalProgress.jsx'
import { DECISION_GLYPHS, DECISIONS } from '../decisions.js'
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

function CancelModal({ application, onSubmit, onClose, isSubmitting = false, error = null }) {
  // Held through the exit so the dialog still has something to render while it
  // animates out — see useClosingValue.
  const shown = useClosingValue(application)

  // Held so the footer does not flip back to its idle labels while the dialog
  // fades: a successful write clears the target and resets these together.
  const busy = useClosingProp(isSubmitting, Boolean(application))

  if (!shown) return null

  return (
    <Modal
      open={Boolean(application)}
      title={`Cancel application #${shown.loanApplicationId}`}
      onClose={onClose}
      footer={
        <>
          <IconButton
            glyph={DECISION_GLYPHS[DECISIONS.Return]}
            label="Keep it"
            onClick={onClose}
            disabled={busy}
          />
          <IconButton
            glyph={DECISION_GLYPHS[DECISIONS.Reject]}
            label="Cancel application"
            tone="danger"
            busy={busy}
            onClick={() => onSubmit({})}
            disabled={busy}
          />
        </>
      }
    >
      <ModalProgress application={shown} />

      <p className="cancelapp__lead">
        This withdraws the application for good. It cannot be reopened — applying again
        starts a new one at the back of the queue.
      </p>

      <dl className="cancelapp__facts">
        <div className="cancelapp__fact">
          <dt>Amount</dt>
          <dd className="cancelapp__amount">{currency.format(shown.amount)}</dd>
        </div>
        <div className="cancelapp__fact">
          <dt>Plan</dt>
          <dd>{shown.paymentPlan?.name ?? '—'}</dd>
        </div>
        <div className="cancelapp__fact">
          <dt>Requested</dt>
          <dd>{date.format(new Date(shown.dateRequested))}</dd>
        </div>
        <div className="cancelapp__fact">
          <dt>Status</dt>
          <dd>
            <ApplicationStatusBadge status={shown.status} />
          </dd>
        </div>
      </dl>

      {error && (
        <p className="cancelapp__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}

export default CancelModal
