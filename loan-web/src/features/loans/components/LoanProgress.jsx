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

/**
 * One loan, told as repayment progress rather than as a row of figures.
 *
 * The bar carries two values, not one: how much has been repaid, and a marker for where
 * the schedule says the borrower should be today. A single percentage cannot say "on
 * track" or "behind" — the gap between the two is the only thing that can, and it is why
 * this exists instead of reusing the table's bar.
 *
 * Reads nothing staff-only. `grade`, `daysBehind` and `isGoodPayer` come back null for a
 * Loaner (rule 21), so `behindBy` and `expectedPaidToDate` carry the whole story.
 *
 * Its own Progress markup rather than the shared component: that one takes a single
 * value and this needs a second element positioned inside the same track. Tone and
 * geometry still come from tokens (rule 10).
 */
function LoanProgress({ loan }) {
  const repaid = repaidPercent(loan)
  const expected = expectedPercent(loan)
  const behind = (loan.standing?.behindBy ?? 0) > 0
  const note = dueNote(loan)
  const paid = loan.totalRepaymentAmount - loan.balance

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

      <p className="loanp__balance">
        <span className="loanp__figure">{currency.format(loan.balance)}</span>
        <span className="loanp__balance-label">still to pay</span>
      </p>

      <div
        className="loanp__track"
        role="progressbar"
        aria-valuenow={Math.round(repaid)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Repaid on loan #${loan.loanId}`}
      >
        <div
          className="loanp__bar"
          style={{
            width: `${Math.min(100, Math.max(0, repaid))}%`,
            background: `var(--bar-${behind ? 'warning' : 'accent'})`,
          }}
        />

        {/* Only drawn when the schedule has an opinion. A loan that has not started, or
            one whose term is a single day, gives no meaningful expected figure. */}
        {expected !== null && (
          <span className="loanp__marker" style={{ left: `${expected}%` }} />
        )}
      </div>

      <p className="loanp__legend">
        <span className="loanp__legend-item">
          {currency.format(paid)} of {currency.format(loan.totalRepaymentAmount)} repaid
        </span>
        {expected !== null && (
          <span className="loanp__legend-item loanp__legend-item--marker">
            expected by today
          </span>
        )}
      </p>

      {/* The sentence that matters. Said plainly rather than left for the reader to work
          out of the gap between a bar and a marker. */}
      {behind ? (
        <p className="loanp__status loanp__status--behind">
          {currency.format(loan.standing.behindBy)} behind schedule
        </p>
      ) : (
        <p className="loanp__status loanp__status--ontrack">On schedule</p>
      )}

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
