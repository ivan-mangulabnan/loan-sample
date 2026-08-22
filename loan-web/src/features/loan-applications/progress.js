import { codeFor } from './actions.js'

/**
 * How far an application has travelled, as steps for the generic <Stepper>.
 *
 * The sibling of actions.js and decisions.js: those name what the borrower and the staff
 * can DO, this names where the application IS. The Stepper itself knows nothing about
 * loans (rule 4), so the translation lives here in the feature.
 */

/**
 * The four stages, in order. "Submitted" is a stage an application can come back TO, not
 * only leave: a reviewer's return sends it there for the borrower to act on, which is
 * why a return is not drawn as a failed review — nobody failed, it needs work.
 */
export const STAGES = ['Submitted', 'Review', 'Approval', 'Released']

/**
 * Where each status sits and how that stage reads.
 *
 *   at     — 1-based stage the application occupies; every earlier stage is 'done'
 *   status — the Stepper state for that stage
 *   label  — replaces the stage's name when the outcome has to be said out loud
 *
 * Keyed on the CODE. The API sends Status.Label ("Pending Review") and every rule worth
 * writing is in codes — see codeFor, and the warning in statusOptions.js about what a
 * label used as a code silently does.
 *
 * The three terminal states carry no 'active'/'waiting' step at all, which is the case
 * Stepper's activeIndex falls back for; see the comment there.
 */
const AT = {
  PENDING_REVIEW: { at: 2, status: 'waiting' },
  PENDING_APPROVAL: { at: 3, status: 'waiting' },
  PENDING_RELEASE: { at: 4, status: 'waiting' },
  RELEASED: { at: 4, status: 'done' },

  // Back to stage 1, named for what it needs rather than for what happened: the borrower
  // is the one who has to move, and "Review" sitting red would blame the wrong desk.
  //
  // 'pending', not 'invalid': nothing failed and nothing is terminal — the application is
  // parked until the borrower acts, so it pulses in warning rather than sitting in the
  // red reserved for a dead end. One word, because a two-line label wraps the whole
  // stepper onto an extra row and was the single largest block in the resubmit modal.
  RETURNED_BY_REVIEWER: { at: 1, status: 'pending', label: 'Resubmission' },

  // The outcome word replaces the final stage's name, so a dead end never reads as
  // progress towards release. Which desk ended it is derivable from the Reviews and
  // Approvals arrays, but the modal already prints their remarks underneath — marking a
  // middle stage instead would make the reader decode a colour to learn the outcome.
  REJECTED: { at: 4, status: 'invalid', label: 'Rejected' },
  CANCELLED: { at: 4, status: 'invalid', label: 'Cancelled' },
}

/**
 * Steps for a status CODE. The honest entry point for a caller that knows the code
 * outright rather than holding an application — the release queue is pinned to
 * PENDING_RELEASE server-side, so it states that instead of inventing a label to
 * translate back.
 */
export function stagesForCode(code) {
  const hit = AT[code]
  if (!hit) return null

  return STAGES.map((name, index) => {
    const step = index + 1

    if (step < hit.at) return { label: name, status: 'done' }
    if (step === hit.at) return { label: hit.label ?? name, status: hit.status }

    return { label: name, status: 'todo' }
  })
}

/**
 * Steps for the status LABEL the API sends, or null when it is unrecognised — the same
 * silence statusTone chooses over throwing. A modal opened to act on an application must
 * not blank because one label drifted.
 */
export function stagesFor(status) {
  return stagesForCode(codeFor(status))
}
