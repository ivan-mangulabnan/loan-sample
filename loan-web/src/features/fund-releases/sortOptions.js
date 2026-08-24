const byApproval = (a, b) =>
  new Date(a.approvalDate) - new Date(b.approvalDate) || a.loanApprovalId - b.loanApprovalId

export const RELEASE_SORT_OPTIONS = [
  { value: 'oldest', label: 'Oldest first', compare: byApproval },
  { value: 'latest', label: 'Latest first', compare: (a, b) => byApproval(b, a) },
]
