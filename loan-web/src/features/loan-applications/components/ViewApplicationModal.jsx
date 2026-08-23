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

/**
 * An application, read-only.
 *
 * The counterpart to CancelModal and ResubmitModal: the same dialog, the same facts, no
 * way to change anything. It exists because viewing and acting were once the same
 * gesture — a row was openable only when it was also actionable, which hid four of the
 * eight statuses, including the two a borrower most wants to read (Released, and
 * Pending Release, where the money is in flight). A settled application is readable
 * forever and actionable never.
 *
 * `onAct` carries the row's own action into the footer when it has one. Opening a record
 * to look at it and then having to close, find the row again and press its button is a
 * detour — the decision is made while reading, so the way to act belongs here. Which
 * action appears is `actionFor`'s call, the same function the table asks, so the dialog
 * and the row can never offer different things.
 *
 * Read-only when there is nothing to do: a settled application renders no footer at all,
 * rather than one holding a lone Close. The ✕ and Escape already dismiss, and a button
 * row with nothing to confirm invites a click that does nothing.
 *
 * Refetches by id rather than rendering the row it was opened from. The list carries a
 * summary — the reviews, approvals and releases that make up the notes below are only
 * on the single-record read.
 */
function ViewApplicationModal({ application, onClose, onAct }) {
  // Hooks run before any early return; the caller mounts this only with a target, and
  // the id is stable for the life of that mount.
  const full = useApplication(application?.loanApplicationId)

  if (!application) return null

  // The row we already have, upgraded in place when the full record lands. Showing the
  // summary immediately beats a spinner over facts the reader can already be reading.
  const app = full.data ?? application
  const approval = (app.approvals ?? []).at(-1)

  // Asked of the row, not of the refetched record: the two agree, and the row is what
  // the reader clicked. A settled application answers null and gets no footer.
  const action = onAct ? actionFor(app) : null
  const destructive = action === BORROWER_ACTIONS.Cancel

  return (
    <Modal
      open
      title={`Application #${app.loanApplicationId}`}
      onClose={onClose}
      footer={
        action ? (
          // A written label, not one of the glyph IconButtons the sibling dialogs use.
          // Those work because two or three sit together and contrast; alone in a
          // footer, a red ✕ directly under the header's ✕ reads as a second way to
          // dismiss — and IconButton only reveals its label on hover or focus, so a
          // touch reader would get no warning before ending their application.
          //
          // Opening a confirm rather than writing anything: CancelModal still asks.
          <Button
            variant={destructive ? 'default' : 'accent'}
            onClick={() => onAct(application)}
          >
            {destructive ? 'Cancel application' : 'Resubmit'}
          </Button>
        ) : null
      }
    >
      {/* The whole record, not just the status: it is what lets the stepper mark the
          desk that actually rejected rather than ticking it green. */}
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

        {/* The granted terms, once an approver has set them. Beside the requested
            amount rather than replacing it: the two can differ, and comparing them is
            the reason to show both. */}
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
