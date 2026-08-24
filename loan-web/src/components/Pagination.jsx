import Button from './Button.jsx'
import './Pagination.css'

function Pagination({ page, totalPages, hasNext, hasPrevious, onPage }) {
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
