import Button from './Button.jsx'
import './Pagination.css'

/**
 * Prev/next over a `PagedResponse` envelope. Every value it renders or acts on comes
 * from the server — `totalPages`, `hasNext`, `hasPrevious` are fields on the response,
 * not arithmetic done here. Deriving them client-side means the last page's Next button
 * disagrees with the API the moment a row is added between two requests.
 *
 * Knows nothing about what is being paged (rule 4).
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
