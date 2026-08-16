import { loanStatusTone } from '../statuses.js'

function LoanStatusBadge({ status }) {
  const tone = loanStatusTone(status)

  return <span className={`badge badge--${tone}`}>{status ?? 'Unknown'}</span>
}

export default LoanStatusBadge
