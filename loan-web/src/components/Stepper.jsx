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
 *                  'pending'  — blocked on the READER, pulses in warning
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

  const markedIndex = items.findIndex((item, index) =>
    item.status
      ? item.status === 'active' || item.status === 'waiting' || item.status === 'pending'
      : index + 1 === current,
  )

  // A live step ('active'/'waiting'/'pending') is the usual marker, but a flow can end
  // with none of them — every
  // stage done, or stopped on an 'invalid' one. Without a fallback findIndex returns -1,
  // the bar fill collapses to `0 || current` and the group names itself after step 1: a
  // finished flow drew as though it had never started, and a failed one announced its
  // first stage. The furthest step that is not 'todo' is how far it actually reached.
  const lastReached = items.reduce(
    (found, item, index) => (item.status && item.status !== 'todo' ? index : found),
    -1,
  )
  const activeIndex = markedIndex !== -1 ? markedIndex : lastReached
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
                  // 'waiting', 'pending' or 'invalid' step still reads as arrived-at.
                  step <= (activeIndex + 1 || current) ? ' stepper__bar--filled' : ''
                }`}
                aria-hidden="true"
              />
            )}
            <div className={`stepper__step stepper__step--${state}`}>
              <span className="stepper__dot">
                {/* The numeral is decorative once a glyph replaces it; the state
                    is carried by the visually-hidden text below either way.

                    'invalid' gets a cross for the same reason 'done' gets a check: a
                    bare numeral in a red ring says "this one is different" without
                    saying how, and the colour alone is not a message anyone should have
                    to decode — least of all a reader who cannot see it. */}
                <span aria-hidden="true">
                  {isDone || state === 'invalid' ? (
                    <svg
                      className={state === 'invalid' ? 'stepper__cross' : 'stepper__check'}
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {state === 'invalid' ? (
                        <>
                          <path d="M4.5 4.5l7 7" />
                          <path d="M11.5 4.5l-7 7" />
                        </>
                      ) : (
                        <path d="M3.5 8.5l3 3 6-6.5" />
                      )}
                    </svg>
                  ) : (
                    step
                  )}
                </span>
                {(state === 'waiting' || state === 'pending') && (
                  <span className="stepper__pulse" aria-hidden="true" />
                )}
              </span>
              <span className="stepper__label">{item.label}</span>
              <span className="stepper__state">
                {isDone
                  ? ' (completed)'
                  : state === 'waiting'
                    ? ' (waiting)'
                    : state === 'pending'
                      ? ' (waiting for you)'
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
