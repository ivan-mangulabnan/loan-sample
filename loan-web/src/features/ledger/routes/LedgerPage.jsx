import { useCallback } from 'react'
import Button from '../../../components/Button.jsx'
import Callout from '../../../components/Callout.jsx'
import { useListQuery } from '../../../hooks/useListQuery.js'
import { useWriteAction } from '../../../hooks/useWriteAction.js'
import { ListView } from '../../dashboard/index.js'
import DepositModal from '../components/DepositModal.jsx'
import TransactionTable from '../components/TransactionTable.jsx'
import { postCapitalDeposit } from '../api.js'
import { useLedger, useLedgerTransactions } from '../hooks.js'
import { TRANSACTION_TYPE_OPTIONS } from '../transactionTypes.js'
import './LedgerPage.css'

// useWriteAction keys its dialog on a target row and treats null as "closed". There is
// no row here — the deposit acts on the ledger itself — so this stands in as the open
// target. Any truthy value would do; a named constant says why it exists.
const DEPOSIT = Symbol('deposit')

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

/**
 * The capital area: what the tenant holds, every movement that produced it, and the one
 * way to add more.
 *
 * The balance is a denormalised running total and the rows are the entries behind it —
 * two representations the backend keeps in step inside a transaction. Showing them
 * together is the point of the page: the figure alone is already on the dashboard as
 * "Capital on hand", and it explains nothing by itself.
 *
 * Deposits, releases and payments all land here, so this is the only screen where the
 * three desks' effects on the money are visible in one list.
 */
export function LedgerPage() {
  const [query, onQueryChange] = useListQuery()

  const ledger = useLedger()
  const transactions = useLedgerTransactions(query)

  // A deposit moves the balance and adds a row, so both reload. Refreshing only the list
  // would leave a stale figure above rows that contradict it.
  const reloadBoth = useCallback(() => {
    ledger.reload()
    transactions.reload()
  }, [ledger, transactions])

  const send = useCallback((_target, { amount }) => postCapitalDeposit({ amount }), [])
  const deposit = useWriteAction(send, reloadBoth)

  // 409 on either read means this tenant has no operating ledger. Nothing can be
  // deposited into it and there are no rows to show, so the page states that and stops
  // rather than offering an action that cannot succeed.
  const noLedger = ledger.error?.status === 409
  const balance = ledger.data?.currentBalance

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="heading">Ledger</h1>
          <p className="muted">Capital on hand and every movement through it</p>
        </div>
        <div className="ledger__actions">
          <Button size="sm" onClick={reloadBoth}>
            Refresh
          </Button>
          {!noLedger && (
            <Button size="sm" variant="accent" onClick={() => deposit.open(DEPOSIT)}>
              Post deposit
            </Button>
          )}
        </div>
      </header>

      {deposit.notice && (
        <Callout onDismiss={deposit.dismissNotice}>{deposit.notice}</Callout>
      )}

      {noLedger ? (
        <Callout>{ledger.error.message}</Callout>
      ) : (
        <>
          {/* Outside ListView, so it stays put while the rows scroll. */}
          <section className="ledger__balance">
            <p className="section-label">Capital on hand</p>
            <p className="ledger__figure">
              {ledger.isLoading || balance === undefined ? '—' : currency.format(balance)}
            </p>
            <p className="muted">{ledger.data?.name ?? 'Operating ledger'}</p>
          </section>

          <ListView
            query={query}
            onQueryChange={onQueryChange}
            items={transactions.data}
            isLoading={transactions.isLoading}
            error={transactions.error}
            emptyMessage="Nothing has moved through this ledger yet."
            searchPlaceholder="Search by reference number"
            searchLabel="Search ledger entries"
            statusOptions={TRANSACTION_TYPE_OPTIONS}
            statusLabel="Type"
            statusAllLabel="All types"
          >
            {(rows) => <TransactionTable rows={rows} />}
          </ListView>
        </>
      )}

      <DepositModal
        open={deposit.target === DEPOSIT}
        balance={balance}
        onSubmit={deposit.run}
        onClose={deposit.close}
        isSubmitting={deposit.isSubmitting}
        error={deposit.error}
      />
    </>
  )
}

export default LedgerPage
