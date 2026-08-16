/** Mirrors LoanApp/Constants/RoleNames.cs. */
export const ROLES = {
  Admin: 'Admin',
  Reviewer: 'Reviewer',
  Approver: 'Approver',
  Loaner: 'Loaner',
}

/** Every role except Loaner is staff — they see grading and staff names. */
export const ADMIN_ROLES = [ROLES.Admin, ROLES.Reviewer, ROLES.Approver]

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role)
}
