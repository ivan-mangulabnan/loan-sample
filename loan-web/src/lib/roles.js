export const ROLES = {
  Admin: 'Admin',
  Reviewer: 'Reviewer',
  Approver: 'Approver',
  Loaner: 'Loaner',
}

export const ADMIN_ROLES = [ROLES.Admin, ROLES.Reviewer, ROLES.Approver]

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role)
}
