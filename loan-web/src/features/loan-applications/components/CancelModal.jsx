import IconButton from '../../../components/IconButton.jsx'
import Modal from '../../../components/Modal.jsx'
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
  if (!application) return null

  return (
    <Modal
      open
      title={`Cancel application #${application.loanApplicationId}`}
      onClose={onClose}
      footer={
        <>
          <IconButton
            glyph={DECISION_GLYPHS[DECISIONS.Return]}
            label="Keep it"
            onClick={onClose}
            disabled={isSubmitting}
          />
          <IconButton
            glyph={DECISION_GLYPHS[DECISIONS.Reject]}
            label="Cancel application"
            tone="danger"
            busy={isSubmitting}
            onClick={() => onSubmit({})}
            disabled={isSubmitting}
          />
        </>
      }
    >
      <ModalProgress application={application} />

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

      {error && (
        <p className="cancelapp__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}

export default CancelModal
