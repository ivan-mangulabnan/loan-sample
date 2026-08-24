import { codeFor } from './actions.js'

export const STAGES = ['Submitted', 'Review', 'Approval', 'Released']

const AT = {
  PENDING_REVIEW: { at: 2, status: 'waiting' },
  PENDING_APPROVAL: { at: 3, status: 'waiting' },
  PENDING_RELEASE: { at: 4, status: 'waiting' },
  RELEASED: { at: 4, status: 'done' },

  APPROVED: { at: 3, status: 'done' },

  RETURNED_BY_REVIEWER: { at: 1, status: 'pending', label: 'Resubmission' },

  REJECTED: { at: 4, status: 'invalid', label: 'Rejected' },
  CANCELLED: { at: 4, status: 'invalid', label: 'Cancelled' },
}

const DECISION_STAGE = { review: 2, approval: 3, release: 4 }

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

export function stagesFor(status) {
  return stagesForCode(codeFor(status))
}

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

    return { label: STAGES[index], status: 'todo' }
  })
}
