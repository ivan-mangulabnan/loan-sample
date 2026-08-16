import { ROLES } from '../../lib/roles.js'

/**
 * One entry per administrator role. This is the single source of truth for
 * what a role sees: rail items, dashboard heading, and which queue endpoint
 * feeds its work list. The backend still enforces every gate — this only
 * decides what we bother rendering.
 *
 * Derived from LoanApp controllers:
 *   Reviewer → GET /api/ReviewApplication/queue   (PENDING_REVIEW)
 *   Approver → GET /api/LoanApproval/queue        (PENDING_APPROVAL)
 *   Admin    → GET /api/FundRelease/queue         (PENDING_RELEASE)
 *              GET /api/Ledger/balance
 */
export const roleConfig = {
  [ROLES.Reviewer]: {
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
    ],
  },

  [ROLES.Approver]: {
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
    ],
  },

  [ROLES.Admin]: {
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
      { to: '/ledger', glyph: '◈', label: 'Ledger' },
    ],
  },
}

export function configFor(role) {
  return roleConfig[role] ?? null
}
