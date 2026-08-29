export const MIN_AGE_YEARS = 18

export const MAX_AGE_YEARS = 120

// YYYY-MM-DD in the *local* calendar. toISOString() converts to UTC first, which
// shifts the day for anyone east or west of it — a real off-by-one on the exact
// birthday boundary this module exists to police.
export function toDateInput(date) {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function shiftYears(date, years) {
  const next = new Date(date)

  next.setFullYear(next.getFullYear() + years)

  return next
}

// The latest birthdate that still clears MIN_AGE_YEARS — the reader turns 18 today.
export function latestBirthdate(today = new Date()) {
  return toDateInput(shiftYears(today, -MIN_AGE_YEARS))
}

export function earliestBirthdate(today = new Date()) {
  return toDateInput(shiftYears(today, -MAX_AGE_YEARS))
}

// Returns null when the value is acceptable, otherwise the sentence to raise.
//
// Compares the YYYY-MM-DD strings rather than Date objects: the format sorts
// lexicographically, so this stays clear of timezone arithmetic entirely.
//
// Order matters. A future date is reported as a future date, not as "too young" —
// both are true of a date in 2030, and only one of them is useful.
export function birthdateProblem(value, today = new Date()) {
  if (!value) return 'Enter your date of birth.'

  if (Number.isNaN(new Date(`${value}T00:00:00`).getTime()))
    return 'That date of birth is not a real date.'

  if (value > toDateInput(today)) return 'Your date of birth cannot be in the future.'

  if (value > latestBirthdate(today))
    return `You have to be at least ${MIN_AGE_YEARS} to open an account.`

  if (value < earliestBirthdate(today)) return 'That date of birth is not a real date.'

  return null
}
