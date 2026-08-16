import { useNavigate } from 'react-router-dom'
import Callout from '../../../components/Callout.jsx'
import QueueTable from './QueueTable.jsx'
import StatTile from './StatTile.jsx'
import { useLedgerBalance, useRoleQueue } from '../hooks.js'

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

/**
 * Overview for a role that works a queue of other people's applications —
 * Reviewer, Approver, Admin. Which queue comes from the config, never from the
 * role itself.
 */
function StaffDashboard({ config }) {
  const navigate = useNavigate()

  const isAdmin = Boolean(config.ledger)
  const queue = useRoleQueue(config.queue)
  const ledger = useLedgerBalance(isAdmin)

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
          <StatTile
            tone="warning"
            glyph="⏱"
            label="In queue"
            value={rows.length}
            isLoading={queue.isLoading}
          />
          <StatTile
            tone="info"
            glyph="◷"
            label={`Over ${STALE_DAYS} days`}
            value={stale.length}
            isLoading={queue.isLoading}
          />
          <StatTile
            tone="accent"
            glyph="◈"
            label="Queue value"
            value={currency.format(totalOf(rows, config.queue.shape))}
            isLoading={queue.isLoading}
          />
          {isAdmin && (
            <StatTile
              tone="success"
              glyph="₱"
              label="Capital on hand"
              value={
                ledger.data ? currency.format(ledger.data.currentBalance) : '—'
              }
              isLoading={ledger.isLoading}
            />
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

export default StaffDashboard
