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

/**
 * One loan, told as repayment progress rather than as a row of figures.
 *
 * Drawn as a **ring**, not a bar. The bar this replaced was a 14px rule that read as a
 * divider — a horizontal line among other horizontal lines — and the percentage it
 * encoded was never written down anywhere. A circle is a shape nothing else on the page
 * has, so it cannot be mistaken for a border, and its centre gives the number somewhere
 * to actually be said.
 *
 * It still carries two values, which is the whole reason it is not the shared
 * `Progress`: how much has been repaid, and a marker for where the schedule says the
 * borrower should be today. A single percentage cannot say "on track" or "behind" — the
 * gap between the two is the only thing that can.
 *
 * Reads nothing staff-only. `grade`, `daysBehind` and `isGoodPayer` come back null for a
 * Loaner (rule 21), so `behindBy` and `expectedPaidToDate` carry the whole story.
 *
 * Its own markup rather than the shared component: that one takes a single value and
 * renders a bar. Promote on the second use, not the first (rule 3). Tone and geometry
 * still come from tokens (rule 10).
 */
/**
 * Ring geometry, in the SVG's own 100x100 user units. RADIUS leaves room for STROKE to
 * straddle the path without clipping at the viewBox edge: 42 + 8/2 = 46, comfortably
 * inside 50. CIRCUMFERENCE is precomputed because the fill is expressed as a dash length
 * along it.
 */
const RADIUS = 42
const STROKE = 8
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * The "expected by today" tick, in the same user units as the ring. MARKER_LEN spans the
 * 8-unit stroke and overhangs a little either side, so it reads over the fill's rounded
 * cap wherever the two nearly coincide — which is most of a healthy loan's life, and
 * exactly when the reader most wants to compare them.
 *
 * MARKER_WIDTH is deliberately NOT in user units. The dial renders about 148px wide for a
 * 100-unit viewBox, so a 1.5-unit stroke lands on 2.22 device pixels — a fraction the
 * rasteriser cannot paint evenly, and the uneven antialiasing down its length reads as a
 * lean even though the geometry is exactly vertical. Every numeric check passed while the
 * tick visibly tilted, because nothing was wrong with the maths. `vector-effect` in the
 * CSS pins the stroke to a whole 2px on screen regardless of the viewBox scale.
 */
const MARKER_LEN = 12

function LoanProgress({ loan }) {
  const repaid = repaidPercent(loan)
  const expected = expectedPercent(loan)
  const behind = (loan.standing?.behindBy ?? 0) > 0
  const note = dueNote(loan)
  const paid = loan.totalRepaymentAmount - loan.balance

  const pct = Math.min(100, Math.max(0, repaid))

  // Whether the "expected by today" mark means anything. A settled loan has no schedule
  // left to be measured against — the comparison the tick exists to support is over. It
  // also stops the mark reading as a crooked line at the top of a finished ring: on a
  // young loan the schedule expects very little, so the tick sits a few degrees past
  // twelve, which next to a full arc looks like a wonky start-of-ring indicator rather
  // than a date.
  const showExpected = expected !== null && pct < 100

  // The arc sweeps up to its value on arrival, and then holds. This is the ring's only
  // motion — no repeating highlight, no pulse: the number is an accumulation, and watching
  // it accrue once says so, where a loop just draws the eye back to a figure that has not
  // changed.
  //
  // Rendered at 0 for one frame so the CSS transition has two states to move between; a
  // transition cannot animate a first paint.
  const [swept, setSwept] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setSwept(true))
    return () => cancelAnimationFrame(frame)
    // Re-runs per loan: opening a second loan should sweep, not jump from the first
    // one's position.
  }, [loan.loanId])

  // The unfilled remainder, which is what stroke-dashoffset actually takes.
  const offset = CIRCUMFERENCE * (1 - (swept ? pct : 0) / 100)
  // `--bar-*` is a gradient and cannot be a stroke, so the ring takes the flat token the
  // bar's gradient was built from. Same two tones, same meaning.
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
        {/* The same contract the bar carried: one progressbar, the same value and the same
          name. The SVG is decoration over it — a screen reader gets the number, not the
          geometry. */}
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

          {/* Only drawn when the schedule has an opinion. A loan that has not started, or
              one whose term is a single day, gives no meaningful expected figure.

              Placed with a dash pattern rather than a rotation: a leading gap of
              `expected%` of the circumference, then a short visible arc. The whole ring
              is rotated -90deg in CSS, so both this and the fill start at twelve. */}
          {showExpected && (
            <line
              className="loanp__ring-marker"
              // A straight line with explicit endpoints, not a dash on the circle: a dash
              // follows the path it is drawn on, so on a ring it is a curved wedge whose
              // edges splay apart — invisible when horizontal, a clear lean at twelve.
              //
              // Drawn along the y-axis at the ring's radius — already pointing at twelve —
              // then rotated by the value alone. No -90 correction here: the arcs need one
              // because SVG starts their dashes at 3 o'clock, but this line is authored
              // upright, and the <svg>'s own rotate(-90deg) applies to it too. Adding the
              // offset as well put 100% at nine o'clock.
              //
              // Stroke width lives in the CSS, pinned to whole pixels — see MARKER_LEN.
              x1="50"
              y1={50 - RADIUS - MARKER_LEN / 2}
              x2="50"
              y2={50 - RADIUS + MARKER_LEN / 2}
              transform={`rotate(${(expected / 100) * 360 + 90} 50 50)`}
            />
          )}
        </svg>

        {/* HTML, not <text>: it inherits the page's font stack and needs no font metrics
            to sit on the baseline. */}
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

          {/* The sentence that matters. Said plainly rather than left for the reader to
              work out of the gap between an arc and a tick. */}
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
