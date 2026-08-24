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

export function LoanDetailPage() {
  const { id } = useParams()

  const loan = useLoan(id)
  const payments = useLoanPayments(id)

  const filterId = useId()
  const [query, onQueryChange] = useListQuery()
  const [filters, setFilters] = useState(NO_PAYMENT_FILTERS)

  const visible = useMemo(
    () => (payments.data ?? []).filter((p) => matchesPaymentFilters(p, filters)),
    [payments.data, filters],
  )

  const onFilters = useCallback(
    (next) => {
      setFilters(next)
      onQueryChange({ page: 1 })
    },
    [onQueryChange],
  )

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

        {!settled && (
          <Button variant="accent" onClick={() => pay.open(loan.data)}>
            Make a payment
          </Button>
        )}
      </header>

      <div className="loandetail">
        <LoanProgress loan={loan.data} />

        <section className="loandetail__payments">
          <h2 className="section-label">Payments</h2>

          <ListView
            query={query}
            onQueryChange={onQueryChange}
            items={visible}
            isLoading={payments.isLoading}
            error={payments.error}
            searchable={false}
            emptyMessage={
              hasPaymentFilters(filters)
                ? 'No payments match those filters.'
                : 'No payments have been made on this loan yet.'
            }
            sortOptions={PAYMENT_SORT_OPTIONS}
            sortLabel="Sort payments"
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
