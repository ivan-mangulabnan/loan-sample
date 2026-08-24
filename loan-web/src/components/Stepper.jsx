import { Fragment } from 'react'
import './Stepper.css'

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

  const lastReached = items.reduce(
    (found, item, index) => (item.status && item.status !== 'todo' ? index : found),
    -1,
  )
  const activeIndex = markedIndex !== -1 ? markedIndex : lastReached
  const activeLabel = items[activeIndex]?.label ?? items[current - 1]?.label

  return (
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
                  step <= (activeIndex + 1 || current) ? ' stepper__bar--filled' : ''
                }`}
                aria-hidden="true"
              />
            )}
            <div className={`stepper__step stepper__step--${state}`}>
              <span className="stepper__dot">
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
