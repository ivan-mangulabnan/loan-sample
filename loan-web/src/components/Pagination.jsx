import Button from './Button.jsx'
import './Pagination.css'

/**
 * Prev/next over a list that is already in memory. `totalPages`, `hasNext` and
 * `hasPrevious` are computed by ListView from the row count and the measured page size
 * — there is no server-side page to disagree with, because the server sent the list
 * whole and has no opinion about how it is divided.
 *
 * Knows nothing about what is being paged, or about how the page size was arrived at
 * (rule 4).
 */
function Pagination({ page, totalPages, hasNext, hasPrevious, onPage }) {
  // One page of results needs no control at all — and neither does none.
  if (!totalPages || totalPages <= 1) return null

  return (
    <nav className="pager" aria-label="Pagination">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onPage(page - 1)}
        disabled={!hasPrevious}
      >
        ‹ Previous
      </Button>

      {/* aria-live so a screen reader hears the page change: the buttons keep focus,
          so nothing else announces it. */}
      <p className="pager__status muted" aria-live="polite">
        Page {page} of {totalPages}
      </p>

      <Button size="sm" variant="ghost" onClick={() => onPage(page + 1)} disabled={!hasNext}>
        Next ›
      </Button>
    </nav>
  )
}

export default Pagination
