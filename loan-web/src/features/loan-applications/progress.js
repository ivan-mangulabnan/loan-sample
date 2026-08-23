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

  // Approved but not yet handed to a release desk. Absent from this map until a detail
  // page made it visible: stagesFor returned null and the stepper drew nothing at all,
  // which read as "this application has no progress" for the one status that has most
  // of it. Stage 3 is done; the wait is for stage 4 to begin.
  APPROVED: { at: 3, status: 'done' },

  // Back to stage 1, named for what it needs rather than for what happened: the borrower
  // is the one who has to move, and "Review" sitting red would blame the wrong desk.
  //
  // 'pending', not 'invalid': nothing failed and nothing is terminal — the application is
  // parked until the borrower acts, so it pulses in warning rather than sitting in the
  // red reserved for a dead end. One word, because a two-line label wraps the whole
  // stepper onto an extra row and was the single largest block in the resubmit modal.
  RETURNED_BY_REVIEWER: { at: 1, status: 'pending', label: 'Resubmission' },

  // Where a dead end sits when nothing better is known. The status alone does not say
  // which desk ended it, so the mark goes on the last stage and every earlier one reads
  // as done — see stagesForApplication, which does know and puts it in the right place.
  REJECTED: { at: 4, status: 'invalid', label: 'Rejected' },
  CANCELLED: { at: 4, status: 'invalid', label: 'Cancelled' },
}

/** Which stage each kind of decision belongs to, matching STAGES' 1-based positions. */
const DECISION_STAGE = { review: 2, approval: 3, release: 4 }

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

/**
 * The stage a rejection happened at, or null if nothing was rejected.
 *
 * A rejected application carries the refusal on the desk that made it: the review row,
 * the approval row, or a release. Reading it back is what stops the stepper marking the
 * rejecting desk 'done'.
 */
function rejectedAt(application) {
  if ((application?.reviews ?? []).some((r) => codeFor(r.status) === 'REJECTED'))
    return DECISION_STAGE.review

  for (const approval of application?.approvals ?? []) {
    if ((approval.releases ?? []).some((r) => codeFor(r.status) === 'REJECTED'))
      return DECISION_STAGE.release
    if (codeFor(approval.status) === 'REJECTED') return DECISION_STAGE.approval
  }

  return null
}

/**
 * Steps for a whole application rather than for its status alone.
 *
 * The status says an application was rejected; only the decision rows say *where*. With
 * the status alone the mark lands on the last stage and every earlier one is drawn
 * 'done' — so an application refused at approval showed a green tick on Approval,
 * directly above that desk's own "Rejected" note. Use this wherever the record is in
 * hand; stagesFor stays for the callers that hold nothing but a label.
 *
 * Stages after the failure stay 'todo': they never happened. Only a rejection moves —
 * a cancellation is the borrower's own act, not a desk's refusal, and belongs at the
 * end where the status map already puts it.
 */
export function stagesForApplication(application) {
  const steps = stagesFor(application?.status)
  if (!steps) return null

  if (codeFor(application?.status) !== 'REJECTED') return steps

  const at = rejectedAt(application)
  if (!at) return steps

  return steps.map((step, index) => {
    const position = index + 1

    if (position < at) return { ...step, status: 'done' }
    if (position === at) return { ...step, status: 'invalid', label: 'Rejected' }

    // Never reached, so not 'done' and not the failure either.
    return { label: STAGES[index], status: 'todo' }
  })
}
