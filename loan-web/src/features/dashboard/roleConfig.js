import { ROLES } from '../../lib/roles.js'

/**
 * One entry per role. This is the single source of truth for what a role sees:
 * rail items, dashboard heading, and which endpoints feed it. The backend still
 * enforces every gate — this only decides what we bother rendering.
 *
 * `kind` selects the dashboard body:
 *   'queue' — staff working a list of other people's applications. Carries a
 *             single `queue` block naming the endpoint and row shape.
 *   'self'  — a borrower reading their own records. Carries `collections`
 *             instead, because two endpoints feed it.
 *
 * Derived from LoanApp controllers:
 *   Reviewer → GET /api/ReviewApplication/queue   (PENDING_REVIEW)
 *   Approver → GET /api/LoanApproval/queue        (PENDING_APPROVAL)
 *   Admin    → GET /api/FundRelease/queue         (PENDING_RELEASE)
 *              GET /api/Ledger/balance
 *   Loaner   → GET /api/LoanApplication/me, GET /api/Loan/me
 */
export const roleConfig = {
  [ROLES.Reviewer]: {
    kind: 'queue',
    label: 'Reviewer',
    title: 'Review queue',
    subtitle: 'Applications awaiting first-pass review',
    queue: {
      path: '/ReviewApplication/queue',
      // The queue returns LoanApplicationResponse[].
      shape: 'application',
      emptyMessage: 'No applications are waiting for review.',
      calloutAction: 'Open review queue',
      calloutTo: '/review',
    },
    nav: [
      { to: '/', glyph: '⌂', label: 'Overview', end: true },
      { to: '/review', glyph: '▤', label: 'Review queue' },
      { to: '/applications', glyph: '☰', label: 'All applications' },
    ],
  },

  [ROLES.Approver]: {
    kind: 'queue',
    label: 'Approver',
    title: 'Approval queue',
    subtitle: 'Reviewed applications awaiting a decision',
    queue: {
      path: '/LoanApproval/queue',
      shape: 'application',
      emptyMessage: 'No applications are waiting for approval.',
      calloutAction: 'Open approval queue',
      calloutTo: '/approvals',
    },
    nav: [
      { to: '/', glyph: '⌂', label: 'Overview', end: true },
      { to: '/approvals', glyph: '✓', label: 'Approval queue' },
      { to: '/applications', glyph: '☰', label: 'All applications' },
    ],
  },

  [ROLES.Admin]: {
    kind: 'queue',
    label: 'Admin',
    title: 'Fund release',
    subtitle: 'Approved loans awaiting disbursement',
    queue: {
      path: '/FundRelease/queue',
      // The queue returns FundReleaseQueueResponse[] — a different shape.
      shape: 'release',
      emptyMessage: 'Nothing is waiting for release.',
      calloutAction: 'Open release queue',
      calloutTo: '/releases',
    },
    // Only Admin can read the capital ledger.
    ledger: { path: '/Ledger/balance' },
    nav: [
      { to: '/', glyph: '⌂', label: 'Overview', end: true },
      { to: '/releases', glyph: '⇄', label: 'Release queue' },
      { to: '/applications', glyph: '☰', label: 'All applications' },
      { to: '/ledger', glyph: '◈', label: 'Ledger' },
    ],
  },

  // No `queue` key on purpose: useRoleQueue(undefined) resolves to [] without a
  // request, so nothing here fires a staff endpoint a borrower cannot call.
  [ROLES.Loaner]: {
    kind: 'self',
    label: 'Borrower',
    title: 'My loans',
    subtitle: 'Your applications and active loans',
    collections: {
      applications: {
        path: '/LoanApplication/me',
        shape: 'application',
        emptyMessage: 'You have not applied for a loan yet.',
      },
      loans: {
        path: '/Loan/me',
        shape: 'loan',
        emptyMessage: 'You have no loans yet.',
      },
    },
    nav: [
      { to: '/', glyph: '⌂', label: 'Overview', end: true },
      { to: '/applications', glyph: '▤', label: 'My applications' },
      { to: '/loans', glyph: '◈', label: 'My loans' },
    ],
  },
}

export function configFor(role) {
  return roleConfig[role] ?? null
}
