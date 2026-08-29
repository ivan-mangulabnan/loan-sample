import ApplicationRemarks from './ApplicationRemarks.jsx'
import ApplicationStatusBadge from './ApplicationStatusBadge.jsx'
import Button from '../../../components/Button.jsx'
import Modal from '../../../components/Modal.jsx'
import ModalProgress from './ModalProgress.jsx'
import { actionFor, BORROWER_ACTIONS } from '../actions.js'
import { useClosingValue } from '../../../hooks/useClosingValue.js'
import { useApplication } from '../hooks.js'
import './ViewApplicationModal.css'

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

function ViewApplicationModal({ application, onClose, onAct }) {
  // Held through the exit so the dialog still has something to render while it
  // animates out — and so the detail fetch keeps its id rather than going undefined.
  const shown = useClosingValue(application)

  const full = useApplication(shown?.loanApplicationId)

  if (!shown) return null

  const app = full.data ?? shown
  const approval = (app.approvals ?? []).at(-1)

  const canResubmit = onAct && actionFor(app) === BORROWER_ACTIONS.Resubmit

  return (
    <Modal
      open={Boolean(application)}
      title={`Application #${app.loanApplicationId}`}
      onClose={onClose}
      footer={
        canResubmit ? (
          <Button variant="accent" onClick={() => onAct(shown)}>
            Resubmit
          </Button>
        ) : null
      }
    >
      <ModalProgress application={app} />

      <dl className="viewapp__facts">
        {!onAct && app.borrower && (
          <div className="viewapp__fact">
            <dt>Borrower</dt>
            <dd>{app.borrower}</dd>
          </div>
        )}
        <div className="viewapp__fact">
          <dt>Amount requested</dt>
          <dd className="viewapp__amount">{currency.format(app.amount)}</dd>
        </div>
        <div className="viewapp__fact">
          <dt>Plan</dt>
          <dd>{app.paymentPlan?.name ?? '—'}</dd>
        </div>
        <div className="viewapp__fact">
          <dt>Requested</dt>
          <dd>{date.format(new Date(app.dateRequested))}</dd>
        </div>
        <div className="viewapp__fact">
          <dt>Status</dt>
          <dd>
            <ApplicationStatusBadge status={app.status} />
          </dd>
        </div>

        {approval && (
          <>
            <div className="viewapp__fact">
              <dt>Approved principal</dt>
              <dd className="viewapp__amount">
                {currency.format(approval.principalAmount)}
              </dd>
            </div>
            <div className="viewapp__fact">
              <dt>Interest rate</dt>
              <dd>{approval.interestRate}%</dd>
            </div>
            <div className="viewapp__fact">
              <dt>Total to repay</dt>
              <dd>{currency.format(approval.totalRepaymentAmount)}</dd>
            </div>
          </>
        )}
      </dl>

      <h3 className="viewapp__section">Notes from each step</h3>

      {full.error ? (
        <p className="viewapp__note">The notes on this application could not be loaded.</p>
      ) : full.isLoading && !full.data ? (
        <p className="viewapp__note">Loading…</p>
      ) : (
        <ApplicationRemarks application={app} />
      )}
    </Modal>
  )
}

export default ViewApplicationModal
