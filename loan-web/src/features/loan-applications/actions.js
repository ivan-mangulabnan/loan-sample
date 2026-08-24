import { APPLICATION_STATUS_OPTIONS } from './statusOptions.js'

export const BORROWER_ACTIONS = {
  Resubmit: 'Resubmit',
  Cancel: 'Cancel',
}

const NOT_CANCELLABLE = ['RELEASED', 'REJECTED', 'CANCELLED', 'PENDING_RELEASE']

const RETURNED = 'RETURNED_BY_REVIEWER'

export function codeFor(label) {
  if (!label) return null

  const wanted = label.trim().toLowerCase()
  const match = APPLICATION_STATUS_OPTIONS.find(
    (option) => option.label.toLowerCase() === wanted,
  )

  return match?.code ?? null
}

export function actionFor(application) {
  const code = codeFor(application?.status)

  if (code === RETURNED) return BORROWER_ACTIONS.Resubmit
  if (code && !NOT_CANCELLABLE.includes(code)) return BORROWER_ACTIONS.Cancel

  return null
}

export function isReturned(application) {
  return codeFor(application?.status) === RETURNED
}
