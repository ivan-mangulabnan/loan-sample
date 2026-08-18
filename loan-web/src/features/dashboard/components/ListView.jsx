import { useEffect, useId, useRef, useState } from 'react'
import Pagination from '../../../components/Pagination.jsx'
import './ListView.css'

// Long enough that a typed word is one request rather than one per keystroke, short
// enough that the list still feels like it is following along. Superseded requests are
// cancelled by useApiResource's AbortController, so a slow earlier search cannot land
// after a newer one and overwrite it.
const SEARCH_DEBOUNCE_MS = 300

/**
 * The body every list page shares: filter toolbar, a scrolling region of rows, and a
 * pager pinned under it. Five pages had a byte-identical copy of this before it existed.
 *
 * It owns two things the pages should not each re-decide:
 *
 * - **Which changes reset the page.** A new search term or status starts at page 1;
 *   moving the pager does not. Left to the caller, one of the five would eventually ask
 *   for page 4 of a two-page result and render an empty list.
 * - **Where the scrolling happens.** The rows scroll inside this component, not in
 *   `.main`, so the page heading and the pager both stay put. That is what removes the
 *   page-level scrollbar the whole exercise started from.
 *
 * The rows themselves come from `children` as a function of the page's items. ListView
 * stays out of the table business: QueueTable already switches on shape (rule 19), and a
 * second switch here would only be a copy of it with LoanTable bolted on.
 */
function ListView({
  query,
  onQueryChange,
  result,
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

  useEffect(() => {
    if (draft === (query.search ?? '')) return

    const timer = setTimeout(() => onQueryChange({ search: draft, page: 1 }), SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [draft, query.search, onQueryChange])

  // Page 2 opens at row 21, not wherever page 1 was left scrolled to. The region scrolls,
  // not `.main`, so this is the element that has to be reset.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [query.page])

  const items = result?.items ?? []
  const isFiltered = Boolean(query.search || query.status)

  // Rows stay on screen while the next page loads. `useApiResource` holds the previous
  // data until the new response arrives, so blanking the region here would be a
  // self-inflicted flash on every keystroke.
  const showRows = items.length > 0
  const isFirstLoad = isLoading && !result

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

      <div className={`list__rows${isLoading && result ? ' list__rows--busy' : ''}`} ref={scrollRef}>
        {error ? (
          <p className="muted">Could not load: {error.message}</p>
        ) : isFirstLoad ? (
          <p className="muted">Loading…</p>
        ) : showRows ? (
          children(items)
        ) : isFiltered ? (
          // A filtered miss is a different state from an empty list, and saying so is
          // what tells the reader the filter is working rather than the data missing.
          <p className="muted">Nothing matches that search.</p>
        ) : (
          <p className="muted">{emptyMessage}</p>
        )}
      </div>

      <Pagination
        page={result?.page ?? query.page}
        totalPages={result?.totalPages ?? 0}
        hasNext={result?.hasNext ?? false}
        hasPrevious={result?.hasPrevious ?? false}
        onPage={(page) => onQueryChange({ page })}
      />
    </div>
  )
}

export default ListView
