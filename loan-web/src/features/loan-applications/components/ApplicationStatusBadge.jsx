import './ApplicationStatusBadge.css'

function ApplicationStatusBadge({ status }) {
  return <span className="badge">{status ?? 'Unknown'}</span>
}

export default ApplicationStatusBadge
