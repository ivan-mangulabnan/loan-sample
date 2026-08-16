import { useNavigate } from 'react-router-dom'
import Callout from '../../../components/Callout.jsx'
import IconChip from '../../../components/IconChip.jsx'
import { useSession } from '../../auth/index.js'
import QueueTable from '../components/QueueTable.jsx'
import { useLedgerBalance, useRoleQueue } from '../hooks.js'
import { configFor } from '../roleConfig.js'
import './DashboardPage.css'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

const DAY = 24 * 60 * 60 * 1000

/** Rows older than this are what the callout warns about. */
const STALE_DAYS = 5

function ageInDays(row, shape) {
  const raw = shape === 'release' ? row.approvalDate : row.dateRequested
  return Math.floor((Date.now() - new Date(raw).getTime()) / DAY)
}

function totalOf(rows, shape) {
  return rows.reduce(
    (sum, row) => sum + (shape === 'release' ? row.principalAmount : row.amount),
    0,
  )
}

export function DashboardPage() {
  const { role } = useSession()
  const navigate = useNavigate()
  const config = configFor(role)

  const isAdmin = Boolean(config?.ledger)
  const queue = useRoleQueue(config?.queue)
  const ledger = useLedgerBalance(isAdmin)

  if (!config)
    return (
      <header>
        <h1 className="heading">No dashboard for this role</h1>
        <p className="muted">
          The {role ?? 'unknown'} role has no staff dashboard configured.
        </p>
      </header>
    )

  const rows = queue.data ?? []
  const stale = rows.filter(
    (row) => ageInDays(row, config.queue.shape) > STALE_DAYS,
  )

  return (
    <>
      <header>
        <h1 className="heading">{config.title}</h1>
        <p className="muted">{config.subtitle}</p>
      </header>

      {queue.error && (
        <Callout action="Retry" onAction={queue.reload}>
          Could not load the queue: {queue.error.message}
        </Callout>
      )}

      {stale.length > 0 && (
        <Callout
          action={config.queue.calloutAction}
          onAction={() => navigate(config.queue.calloutTo)}
        >
          {stale.length} {stale.length === 1 ? 'item has' : 'items have'} been
          waiting more than {STALE_DAYS} days.
        </Callout>
      )}

      <section>
        <p className="section-label">Summary</p>
        <div className="stats">
          <div>
            <div className="stats__head">
              <IconChip tone="warning">⏱</IconChip>
              <span className="muted">In queue</span>
            </div>
            <p className="stats__value">
              {queue.isLoading ? '—' : rows.length}
            </p>
          </div>

          <div>
            <div className="stats__head">
              <IconChip tone="info">◷</IconChip>
              <span className="muted">Over {STALE_DAYS} days</span>
            </div>
            <p className="stats__value">
              {queue.isLoading ? '—' : stale.length}
            </p>
          </div>

          <div>
            <div className="stats__head">
              <IconChip tone="accent">◈</IconChip>
              <span className="muted">Queue value</span>
            </div>
            <p className="stats__value">
              {queue.isLoading
                ? '—'
                : currency.format(totalOf(rows, config.queue.shape))}
            </p>
          </div>

          {isAdmin && (
            <div>
              <div className="stats__head">
                <IconChip tone="success">₱</IconChip>
                <span className="muted">Capital on hand</span>
              </div>
              <p className="stats__value">
                {ledger.isLoading || !ledger.data
                  ? '—'
                  : currency.format(ledger.data.currentBalance)}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="dashboard__queue">
        <p className="section-label">{config.title}</p>
        {queue.isLoading ? (
          <p className="muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="muted">{config.queue.emptyMessage}</p>
        ) : (
          <QueueTable shape={config.queue.shape} rows={rows} />
        )}
      </section>
    </>
  )
}

export default DashboardPage
