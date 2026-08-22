import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import Pagination from '../../../components/Pagination.jsx'
import './ListView.css'

// Long enough that a typed word is one request rather than one per keystroke, short
// enough that the list still feels like it is following along. Superseded requests are
// cancelled by useApiResource's AbortController, so a slow earlier search cannot land
// after a newer one and overwrite it.
const SEARCH_DEBOUNCE_MS = 300

// Bounds on the measured page size. The floor keeps a pager usable on a phone in
// landscape, where the honest answer would be one row; the ceiling stops a very tall
// screen from putting a hundred rows on a page that nobody scrolls anyway. Between the
// two, the number comes from the viewport and nothing else.
const MIN_ROWS = 3
const MAX_ROWS = 40

// What the first render pages by, before there is a rendered row to measure. It is
// replaced in a layout effect on that same frame, so it is never painted — but a page
// size of 0 would render nothing to measure and the measurement would never happen.
const UNMEASURED_ROWS = 10

// A stable empty list. An inline `?? []` would be a new array on every render before the
// first response lands, and the measuring effect keys off that identity.
const NO_ROWS = []

/**
 * The body every list page shares: filter toolbar, a region of rows sized to the
 * viewport, and a pager pinned under it. Five pages had a byte-identical copy of this
 * before it existed.
 *
 * It owns three things the pages should not each re-decide:
 *
 * - **How many rows are a page.** Measured, not configured: the height this region
 *   actually got, divided by the height a row actually takes. The server sends the whole
 *   filtered list — it cannot know how tall the reader's screen is — so the decision has
 *   to be made here, and it is remade whenever the window changes size.
 * - **Which changes reset the page.** A new search term or status starts at page 1;
 *   moving the pager does not. Left to the caller, one of the six would eventually ask
 *   for page 4 of a two-page result and render an empty list.
 * - **Where the scrolling happens.** The rows scroll inside this component, not in
 *   `.main`, so the page heading and the pager both stay put. With the page sized to fit,
 *   that scrollbar should never appear — `overflow-y: auto` is the guard for the case
 *   where a row turns out taller than the one that was measured.
 *
 * Paging costs no request. `items` is the whole filtered list already in memory, so
 * Next is a slice, not a round trip — which is also why the pager can be re-derived on
 * every resize without hammering the API.
 *
 * The rows themselves come from `children` as a function of the page's items. ListView
 * stays out of the table business: QueueTable already switches on shape (rule 19), and a
 * second switch here would only be a copy of it with LoanTable bolted on.
 */
function ListView({
  query,
  onQueryChange,
  items,
  isLoading,
  error,
  emptyMessage,
  searchPlaceholder = 'Search',
  searchLabel = 'Search',
  statusOptions = null,
  statusLabel = 'Status',
  statusAllLabel = 'All statuses',
  children,
}) {
  const fieldId = useId()
  const scrollRef = useRef(null)

  // The input is uncontrolled by the query on purpose: it has to stay responsive while
  // the committed term lags 300ms behind it.
  const [draft, setDraft] = useState(query.search ?? '')

  const [rowsPerPage, setRowsPerPage] = useState(UNMEASURED_ROWS)

  const rows = items ?? NO_ROWS

  useEffect(() => {
    if (draft === (query.search ?? '')) return

    const timer = setTimeout(() => onQueryChange({ search: draft, page: 1 }), SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [draft, query.search, onQueryChange])

  // How many rows fit, asked of the DOM rather than assumed. Both halves have to be
  // measured: the region's height is whatever the flex column had left after the heading
  // and toolbar, and a row's height depends on whether a long borrower name wrapped.
  //
  // Layout effect, not effect: this runs before paint, so the fallback page size above is
  // corrected in the same frame rather than flashing a wrong number of rows.
  useLayoutEffect(() => {
    const region = scrollRef.current
    if (!region) return

    const measure = () => {
      const rendered = region.querySelectorAll('tbody tr')
      if (rendered.length === 0) return

      // The tallest rendered row, not the average. One wrapped cell makes a single row
      // taller than its neighbours, and a page sized off the average overflows by exactly
      // that row — which is the scrollbar this exists to remove.
      let rowHeight = 0
      for (const row of rendered) rowHeight = Math.max(rowHeight, row.getBoundingClientRect().height)
      if (rowHeight === 0) return

      // The header is inside the scrolling region and does not scroll away, so the space
      // left for rows is what remains under it.
      const head = region.querySelector('thead')
      const headHeight = head ? head.getBoundingClientRect().height : 0

      const fits = Math.floor((region.clientHeight - headHeight) / rowHeight)

      setRowsPerPage(Math.min(MAX_ROWS, Math.max(MIN_ROWS, fits)))
    }

    measure()

    // Window resizes, the rail collapsing at 768px, a zoom change — all of them reach
    // this region as a size change, and none of them are worth a separate listener.
    const observer = new ResizeObserver(measure)
    observer.observe(region)

    return () => observer.disconnect()
    // Re-measured when the rows change: a page of short names and a page with a wrapped
    // one are different heights, and the second one has to shrink the page.
  }, [items])

  const totalPages = Math.ceil(rows.length / rowsPerPage)

  // Clamped rather than corrected through state. Growing the window mid-list can put the
  // stored page past the end, and an effect that wrote the clamped value back would fire
  // on every resize; rendering the nearest real page and letting the next click set it is
  // the same outcome without the loop.
  const page = Math.min(Math.max(query.page, 1), Math.max(totalPages, 1))

  const start = (page - 1) * rowsPerPage
  const pageRows = rows.slice(start, start + rowsPerPage)

  // Page 2 opens at row 21, not wherever page 1 was left scrolled to. Belt and braces
  // now that a page is sized to fit — but a row taller than the measured one can still
  // put the region a few pixels into scroll.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [page])

  const isFiltered = Boolean(query.search || query.status)

  // Rows stay on screen while the next filter loads. `useApiResource` holds the previous
  // data until the new response arrives, so blanking the region here would be a
  // self-inflicted flash on every keystroke.
  const isFirstLoad = isLoading && !items

  return (
    <div className="list">
      <div className="list__toolbar">
        <label className="visually-hidden" htmlFor={`${fieldId}-search`}>
          {searchLabel}
        </label>
        <input
          id={`${fieldId}-search`}
          type="search"
          className="field field--input list__search"
          placeholder={searchPlaceholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />

        {statusOptions && (
          <>
            <label className="visually-hidden" htmlFor={`${fieldId}-status`}>
              {statusLabel}
            </label>
            <select
              id={`${fieldId}-status`}
              className="field field--input list__status"
              value={query.status ?? ''}
              onChange={(event) => onQueryChange({ status: event.target.value, page: 1 })}
            >
              {/* '' rather than a sentinel code: withQuery drops empty values, so
                  "all" is the absence of the parameter, which is what the API reads
                  as "do not filter". */}
              <option value="">{statusAllLabel}</option>
              {statusOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <div className={`list__rows${isLoading && items ? ' list__rows--busy' : ''}`} ref={scrollRef}>
        {error ? (
          <p className="muted">Could not load: {error.message}</p>
        ) : isFirstLoad ? (
          <p className="list__empty">Loading…</p>
        ) : pageRows.length > 0 ? (
          children(pageRows)
        ) : isFiltered ? (
          // A filtered miss is a different state from an empty list, and saying so is
          // what tells the reader the filter is working rather than the data missing.
          <p className="list__empty">Nothing matches that search.</p>
        ) : (
          <p className="list__empty">{emptyMessage}</p>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        hasNext={page < totalPages}
        hasPrevious={page > 1}
        onPage={(next) => onQueryChange({ page: next })}
      />
    </div>
  )
}

export default ListView
