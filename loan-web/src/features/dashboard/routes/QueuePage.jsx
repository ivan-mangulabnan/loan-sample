import Button from '../../../components/Button.jsx'
import { useSession } from '../../auth/index.js'
import QueueTable from '../components/QueueTable.jsx'
import { useRoleQueue } from '../hooks.js'
import { configFor } from '../roleConfig.js'

/**
 * The full work list for whichever role is signed in. One route serves all
 * three because the only differences — endpoint and row shape — come from
 * roleConfig.
 */
export function QueuePage() {
  const { role } = useSession()
  const config = configFor(role)
  const queue = useRoleQueue(config?.queue)

  if (!config)
    return (
      <header>
        <h1 className="heading">Nothing here</h1>
        <p className="muted">This role has no queue.</p>
      </header>
    )

  const rows = queue.data ?? []

  return (
    <>
      <header className="queue-page__head">
        <div>
          <h1 className="heading">{config.title}</h1>
          <p className="muted">{config.subtitle}</p>
        </div>
        <Button size="sm" onClick={queue.reload}>
          Refresh
        </Button>
      </header>

      {queue.error ? (
        <p className="muted">Could not load: {queue.error.message}</p>
      ) : queue.isLoading ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="muted">{config.queue.emptyMessage}</p>
      ) : (
        <QueueTable shape={config.queue.shape} rows={rows} />
      )}
    </>
  )
}

export default QueuePage
