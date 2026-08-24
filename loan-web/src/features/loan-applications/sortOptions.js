const byRequested = (a, b) =>
  new Date(a.dateRequested) - new Date(b.dateRequested) ||
  a.loanApplicationId - b.loanApplicationId

export const OLDEST_FIRST = {
  value: 'oldest',
  label: 'Oldest first',
  compare: byRequested,
}

export const LATEST_FIRST = {
  value: 'latest',
  label: 'Latest first',
  compare: (a, b) => byRequested(b, a),
}

export const QUEUE_SORT_OPTIONS = [OLDEST_FIRST, LATEST_FIRST]

export const RECORD_SORT_OPTIONS = [LATEST_FIRST, OLDEST_FIRST]
