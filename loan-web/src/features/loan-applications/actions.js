import { APPLICATION_STATUS_OPTIONS } from './statusOptions.js'

/**
 * What the borrower can do to one of their own applications.
 *
 * The sibling of decisions.js: that file names what STAFF can do, this one names what the
 * borrower can. Neither knows which endpoint the other calls (rule 4).
 */
export const BORROWER_ACTIONS = {
  Resubmit: 'Resubmit',
  Cancel: 'Cancel',
}

// Mirrors LoanApplicationStatusCodes.Terminal, plus the one extra state CancelAsync
// refuses (LoanApplicationService.cs:139): once the money is queued for release, pulling
// out is no longer the borrower's call.
const NOT_CANCELLABLE = ['RELEASED', 'REJECTED', 'CANCELLED', 'PENDING_RELEASE']

const RETURNED = 'RETURNED_BY_REVIEWER'

/**
 * The API sends Status.Label — "Returned by Reviewer" — while every rule worth writing is
 * expressed in codes. Resolving through the options table rather than spelling the labels
 * out is rule 20a, and here the cost of getting it wrong is specific: a label that fails
 * to match does not throw, it silently reports "no action available", which is the exact
 * dead end this module exists to remove.
 */
function codeFor(label) {
  if (!label) return null

  const wanted = label.trim().toLowerCase()
  const match = APPLICATION_STATUS_OPTIONS.find(
    (option) => option.label.toLowerCase() === wanted,
  )

  return match?.code ?? null
}

/**
 * The one action a row offers, or null. Returns a single action rather than a list
 * because the table has room for one button.
 *
 * A returned application is both resubmittable and cancellable; it offers Resubmit, and
 * ResubmitModal carries the way out from inside — the borrower reading the reviewer's
 * remarks is exactly who should be deciding between the two.
 */
export function actionFor(application) {
  const code = codeFor(application?.status)

  if (code === RETURNED) return BORROWER_ACTIONS.Resubmit
  if (code && !NOT_CANCELLABLE.includes(code)) return BORROWER_ACTIONS.Cancel

  return null
}

/** True when this application is the one the reviewer sent back. */
export function isReturned(application) {
  return codeFor(application?.status) === RETURNED
}
