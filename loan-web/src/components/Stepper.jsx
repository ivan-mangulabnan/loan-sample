import { Fragment } from 'react'
import './Stepper.css'

/**
 * Numbered progress indicator for any multi-step flow — a signup wizard, a loan
 * review queue, a release pipeline. Generic by design: it knows about step
 * status, nothing about the domain.
 *
 * steps:   array of strings, or of { label, status } objects.
 *          status: 'done'     — finished and valid, shows a check mark
 *                  'active'   — the current step
 *                  'waiting'  — blocked on someone else, pulses
 *                  'todo'     — not reached yet
 *                  'invalid'  — visited but needs fixing
 *          Plain strings derive done/active/todo from `current`.
 * current: 1-based index of the active step. Ignored for a step that declares
 *          its own status.
 * size:    'md' (default) | 'sm'
 */

// Derive the state of a plain string step from its position.
function stateFromPosition(step, current) {
  if (step === current) return 'active'
  return step < current ? 'done' : 'todo'
}

function Stepper({ steps, current = 1, size = 'md' }) {
  const items = steps.map((step) =>
    typeof step === 'string' ? { label: step, status: null } : step,
  )

  const activeIndex = items.findIndex((item, index) =>
    item.status ? item.status === 'active' || item.status === 'waiting' : index + 1 === current,
  )
  const activeLabel = items[activeIndex]?.label ?? items[current - 1]?.label

  return (
    // A status readout, not navigation: the steps are not clickable, so this is
    // a labelled group rather than a list of links.
    <div
      className={`stepper${size !== 'md' ? ` stepper--${size}` : ''}`}
      role="group"
      aria-label={`Step ${activeIndex + 1 || current} of ${items.length}${
        activeLabel ? `: ${activeLabel}` : ''
      }`}
    >
      {items.map((item, index) => {
        const step = index + 1
        const state = item.status ?? stateFromPosition(step, current)
        const isDone = state === 'done'

        return (
          <Fragment key={item.label}>
            {step > 1 && (
              <span
                className={`stepper__bar${
                  // Fill the connector up to the furthest step reached, so a
                  // 'waiting' or 'invalid' step still reads as arrived-at.
                  step <= (activeIndex + 1 || current) ? ' stepper__bar--filled' : ''
                }`}
                aria-hidden="true"
              />
            )}
            <div className={`stepper__step stepper__step--${state}`}>
              <span className="stepper__dot">
                {/* The numeral is decorative once a check replaces it; the state
                    is carried by the visually-hidden text below either way. */}
                <span aria-hidden="true">
                  {isDone ? (
                    <svg
                      className="stepper__check"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3.5 8.5l3 3 6-6.5" />
                    </svg>
                  ) : (
                    step
                  )}
                </span>
                {state === 'waiting' && (
                  <span className="stepper__pulse" aria-hidden="true" />
                )}
              </span>
              <span className="stepper__label">{item.label}</span>
              <span className="stepper__state">
                {isDone
                  ? ' (completed)'
                  : state === 'waiting'
                    ? ' (waiting)'
                    : state === 'invalid'
                      ? ' (needs attention)'
                      : ''}
              </span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

export default Stepper
