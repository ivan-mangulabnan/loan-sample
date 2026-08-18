import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../../../components/Button.jsx'
import Callout from '../../../components/Callout.jsx'
import { useWriteAction } from '../../../hooks/useWriteAction.js'
import LoanProgress from '../components/LoanProgress.jsx'
import PayModal from '../components/PayModal.jsx'
import PaymentHistory from '../components/PaymentHistory.jsx'
import { postPayment } from '../api.js'
import { useLoan, useLoanPayments } from '../hooks.js'
import { isSettled } from '../progress.js'
import './LoanDetailPage.css'

/**
 * One loan in full: where the repayment stands, what has been paid, and the one action a
 * borrower has against it.
 *
 * A sibling route of the list rather than a panel inside it — /loans renders the table,
 * /loans/:id unmounts it and mounts this, and Back restores the table with its filter
 * intact. That makes a loan linkable and survivable across a refresh, which a selection
 * held in state would not be.
 */
export function LoanDetailPage() {
  const { id } = useParams()

  const loan = useLoan(id)
  const payments = useLoanPayments(id)

  // Both resources move on a payment: the balance and possibly the status on one, a new
  // row on the other. Re-read rather than patch — settling the balance is what closes
  // the loan, so the status is a consequence the server decides, not one we can predict.
  const afterPayment = useCallback(() => {
    loan.reload()
    payments.reload()
  }, [loan, payments])

  const send = useCallback(
    (target, { amount }) => postPayment({ loanId: target.loanId, amount }),
    [],
  )

  const pay = useWriteAction(send, afterPayment)

  if (loan.error)
    return (
      <>
        <header className="page-head">
          <div>
            <h1 className="heading">Loan</h1>
            <p className="muted">Could not load this loan: {loan.error.message}</p>
          </div>
          <Link className="btn btn--ghost" to="/loans">
            Back to my loans
          </Link>
        </header>
      </>
    )

  if (!loan.data) return <p className="muted">Loading…</p>

  const settled = isSettled(loan.data)

  return (
    <>
      <header className="page-head">
        <div>
          <Link className="loandetail__back" to="/loans">
            ← My loans
          </Link>
          <h1 className="heading">Loan #{loan.data.loanId}</h1>
          <p className="muted">Repayment progress and history</p>
        </div>

        {/* Gated on the terminal statuses, not on lateness: an overdue loan is exactly
            the one that needs paying. */}
        {!settled && (
          <Button variant="accent" onClick={() => pay.open(loan.data)}>
            Make a payment
          </Button>
        )}
      </header>

      {pay.notice && <Callout onDismiss={pay.dismissNotice}>{pay.notice}</Callout>}

      <div className="loandetail">
        <LoanProgress loan={loan.data} />

        <section className="loandetail__payments">
          <h2 className="section-label">Payments</h2>
          <PaymentHistory
            payments={payments.data}
            isLoading={payments.isLoading}
            error={payments.error}
          />
        </section>
      </div>

      <PayModal
        loan={pay.target}
        onSubmit={pay.run}
        onClose={pay.close}
        isSubmitting={pay.isSubmitting}
        error={pay.error}
      />
    </>
  )
}

export default LoanDetailPage
