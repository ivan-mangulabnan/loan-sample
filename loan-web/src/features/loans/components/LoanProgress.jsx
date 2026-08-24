import { useEffect, useState } from 'react'
import LoanStatusBadge from './LoanStatusBadge.jsx'
import { dueNote, expectedPercent, repaidPercent } from '../progress.js'
import './LoanProgress.css'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
})

const date = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const RADIUS = 42
const STROKE = 8
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const MARKER_LEN = 12

function LoanProgress({ loan }) {
  const repaid = repaidPercent(loan)
  const expected = expectedPercent(loan)
  const behind = (loan.standing?.behindBy ?? 0) > 0
  const note = dueNote(loan)
  const paid = loan.totalRepaymentAmount - loan.balance

  const pct = Math.min(100, Math.max(0, repaid))

  const showExpected = expected !== null && pct < 100

  const [swept, setSwept] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setSwept(true))
    return () => cancelAnimationFrame(frame)
  }, [loan.loanId])

  const offset = CIRCUMFERENCE * (1 - (swept ? pct : 0) / 100)
  const tone = behind ? 'var(--warning)' : 'var(--accent)'

  return (
    <section className="loanp">
      <header className="loanp__head">
        <div>
          <h2 className="loanp__title">Loan #{loan.loanId}</h2>
          <p className="loanp__sub">
            {currency.format(loan.principalAmount)} borrowed over {loan.numberOfMonths}{' '}
            months at {loan.interestRate}%
          </p>
        </div>
        <LoanStatusBadge status={loan.status} />
      </header>

      <div className="loanp__readout">
      <div
        className="loanp__dial"
        role="progressbar"
        aria-valuenow={Math.round(repaid)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Repaid on loan #${loan.loanId}`}
      >
        <svg
          className="loanp__ring"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <circle
            className="loanp__ring-track"
            cx="50"
            cy="50"
            r={RADIUS}
            strokeWidth={STROKE}
          />
          <circle
            className="loanp__ring-fill"
            cx="50"
            cy="50"
            r={RADIUS}
            strokeWidth={STROKE}
            stroke={tone}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />

          {showExpected && (
            <line
              className="loanp__ring-marker"
              x1="50"
              y1={50 - RADIUS - MARKER_LEN / 2}
              x2="50"
              y2={50 - RADIUS + MARKER_LEN / 2}
              transform={`rotate(${(expected / 100) * 360 + 90} 50 50)`}
            />
          )}
        </svg>

        <div className="loanp__dial-centre">
          <span className="loanp__pct">{Math.round(pct)}%</span>
          <span className="loanp__dial-label">repaid</span>
        </div>
      </div>

        <div className="loanp__readout-text">
          <p className="loanp__balance">
            <span className="loanp__figure">{currency.format(loan.balance)}</span>
            <span className="loanp__balance-label">still to pay</span>
          </p>

          {behind ? (
            <p className="loanp__status loanp__status--behind">
              {currency.format(loan.standing.behindBy)} behind schedule
            </p>
          ) : (
            <p className="loanp__status loanp__status--ontrack">On schedule</p>
          )}

          <p className="loanp__legend">
            <span className="loanp__legend-item">
              {currency.format(paid)} of {currency.format(loan.totalRepaymentAmount)}{' '}
              repaid
            </span>
            {showExpected && (
              <span className="loanp__legend-item loanp__legend-item--marker">
                expected by today
              </span>
            )}
          </p>
        </div>
      </div>

      <dl className="loanp__facts">
        <div className="loanp__fact">
          <dt>Started</dt>
          <dd>{date.format(new Date(loan.startDate))}</dd>
        </div>
        <div className="loanp__fact">
          <dt>Due</dt>
          <dd>
            {date.format(new Date(loan.dueDate))}
            {note && <span className="loanp__note">{note}</span>}
          </dd>
        </div>
        {loan.closedDate ? (
          <div className="loanp__fact">
            <dt>Closed</dt>
            <dd>{date.format(new Date(loan.closedDate))}</dd>
          </div>
        ) : (
          <div className="loanp__fact">
            <dt>Per day</dt>
            <dd>
              {currency.format(loan.standing?.dailyAmortisation ?? 0)}
              <span className="loanp__note">to finish on time</span>
            </dd>
          </div>
        )}
      </dl>
    </section>
  )
}

export default LoanProgress
