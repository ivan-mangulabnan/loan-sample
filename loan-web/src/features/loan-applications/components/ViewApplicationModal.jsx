import ApplicationRemarks from './ApplicationRemarks.jsx'
import ApplicationStatusBadge from './ApplicationStatusBadge.jsx'
import Button from '../../../components/Button.jsx'
import Modal from '../../../components/Modal.jsx'
import ModalProgress from './ModalProgress.jsx'
import { actionFor, BORROWER_ACTIONS } from '../actions.js'
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
  const full = useApplication(application?.loanApplicationId)

  if (!application) return null

  const app = full.data ?? application
  const approval = (app.approvals ?? []).at(-1)

  const action = onAct ? actionFor(app) : null
  const destructive = action === BORROWER_ACTIONS.Cancel

  return (
    <Modal
      open
      title={`Application #${app.loanApplicationId}`}
      onClose={onClose}
      footer={
        action ? (
          <Button
            variant={destructive ? 'default' : 'accent'}
            onClick={() => onAct(application)}
          >
            {destructive ? 'Cancel application' : 'Resubmit'}
          </Button>
        ) : null
      }
    >
      <ModalProgress application={app} />

      <dl className="viewapp__facts">
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
