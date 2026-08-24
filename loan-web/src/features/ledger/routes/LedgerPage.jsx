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

const DEPOSIT = Symbol('deposit')

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

export function LedgerPage() {
  const [query, onQueryChange] = useListQuery()

  const ledger = useLedger()
  const transactions = useLedgerTransactions(query)

  const reloadBoth = useCallback(() => {
    ledger.reload()
    transactions.reload()
  }, [ledger, transactions])

  const send = useCallback((_target, { amount }) => postCapitalDeposit({ amount }), [])
  const deposit = useWriteAction(send, reloadBoth)

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

      {noLedger ? (
        <Callout>{ledger.error.message}</Callout>
      ) : (
        <>
          <section className="ledger__balance">
            <p className="section-label">Capital on hand</p>
            <p className="ledger__figure">
              {ledger.isLoading || balance === undefined ? '—' : currency.format(balance)}
            </p>
            <p className="muted">{ledger.data?.name ?? 'Operating ledger'}</p>
          </section>

          <ListView
            skeletonColumns={4}
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
