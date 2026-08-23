import { useCallback, useId, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../../../components/Button.jsx'
import { useWriteAction } from '../../../hooks/useWriteAction.js'
import LoanProgress from '../components/LoanProgress.jsx'
import PayModal from '../components/PayModal.jsx'
import PaymentHistory from '../components/PaymentHistory.jsx'
import PaymentFilters from '../components/PaymentFilters.jsx'
import { postPayment } from '../api.js'
import { useLoan, useLoanPayments } from '../hooks.js'
import { isSettled } from '../progress.js'
import {
  hasPaymentFilters,
  matchesPaymentFilters,
  NO_PAYMENT_FILTERS,
  PAYMENT_SORT_OPTIONS,
} from '../sortOptions.js'
import { ListView } from '../../dashboard/index.js'
import { useListQuery } from '../../../hooks/useListQuery.js'
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

  const filterId = useId()
  // ListView owns page and sort; this owns the two ranges, because they are the
  // caller's vocabulary and ListView must not learn what an amount is (rule 4).
  const [query, onQueryChange] = useListQuery()
  const [filters, setFilters] = useState(NO_PAYMENT_FILTERS)

  // Filtered here, sorted and paged by ListView. Memoised on the identities that can
  // actually change it — the raw list and the four bounds.
  const visible = useMemo(
    () => (payments.data ?? []).filter((p) => matchesPaymentFilters(p, filters)),
    [payments.data, filters],
  )

  // Narrowing the range can strand the reader on a page that no longer exists; ListView
  // clamps the page it renders, so this only has to put the pager back at the start.
  const onFilters = useCallback(
    (next) => {
      setFilters(next)
      onQueryChange({ page: 1 })
    },
    [onQueryChange],
  )

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

      <div className="loandetail">
        <LoanProgress loan={loan.data} />

        {/* Paged, not scrolled: ListView sizes a page to the region it was given, so
            the history stays inside the panel however long it grows. */}
        <section className="loandetail__payments">
          <h2 className="section-label">Payments</h2>

          <ListView
            query={query}
            onQueryChange={onQueryChange}
            items={visible}
            isLoading={payments.isLoading}
            error={payments.error}
            // Nothing to search by: a payment is a date and an amount, and both are
            // filtered by range below.
            searchable={false}
            emptyMessage={
              hasPaymentFilters(filters)
                ? 'No payments match those filters.'
                : 'No payments have been made on this loan yet.'
            }
            sortOptions={PAYMENT_SORT_OPTIONS}
            sortLabel="Sort payments"
            // Visible, because the two range controls beside it carry visible names and
            // an unlabelled select between them reads as a third, nameless filter.
            showSortLabel
            filters={<PaymentFilters id={filterId} value={filters} onChange={onFilters} />}
          >
            {(rows) => <PaymentHistory rows={rows} />}
          </ListView>
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
