import { statusTone } from '../statuses.js'
import './ApplicationStatusBadge.css'

function ApplicationStatusBadge({ status }) {
  const tone = statusTone(status)

  return (
    <span className={`badge badge--${tone}`}>{status ?? 'Unknown'}</span>
  )
}

export default ApplicationStatusBadge
