import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Pagination from '../../../components/Pagination.jsx'
import TableSkeleton from '../../../components/TableSkeleton.jsx'
import { useDeferredPending } from '../../../hooks/useDeferredPending.js'
import './ListView.css'

const SEARCH_DEBOUNCE_MS = 300

const MIN_ROWS = 3
const MAX_ROWS = 40

const UNMEASURED_ROWS = 10

const NO_ROWS = []

function ListView({
  query,
  onQueryChange,
  items,
  isLoading,
  error,
  emptyMessage,
  searchPlaceholder = 'Search',
  searchLabel = 'Search',
  searchable = true,
  statusOptions = null,
  statusLabel = 'Status',
  statusAllLabel = 'All statuses',
  sortOptions = null,
  sortLabel = 'Sort',
  showSortLabel = false,
  filters = null,
  skeletonColumns = 5,
  children,
}) {
  const fieldId = useId()
  const scrollRef = useRef(null)

  const [draft, setDraft] = useState(query.search ?? '')

  const [rowsPerPage, setRowsPerPage] = useState(UNMEASURED_ROWS)

  const hasItems = Boolean(items)

  const showSkeleton = useDeferredPending(isLoading && !hasItems)
  const refetchPending = useDeferredPending(isLoading && hasItems)

  const isBusy = isLoading && refetchPending

  const rows = items ?? NO_ROWS

  const sorted = useMemo(() => {
    if (!sortOptions?.length) return rows

    const chosen =
      sortOptions.find((option) => option.value === query.sort) ?? sortOptions[0]
    if (!chosen.compare) return rows

    return [...rows].sort(chosen.compare)
  }, [rows, query.sort, sortOptions])

  useEffect(() => {
    if (draft === (query.search ?? '')) return

    const timer = setTimeout(() => onQueryChange({ search: draft, page: 1 }), SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [draft, query.search, onQueryChange])

  useLayoutEffect(() => {
    const region = scrollRef.current
    if (!region) return

    const measure = () => {
      const rendered = region.querySelectorAll('tbody tr')
      if (rendered.length === 0) return

      let rowHeight = 0
      for (const row of rendered) rowHeight = Math.max(rowHeight, row.getBoundingClientRect().height)
      if (rowHeight === 0) return

      if (rendered.length > 1) {
        const pitch =
          rendered[rendered.length - 1].getBoundingClientRect().top -
          rendered[rendered.length - 2].getBoundingClientRect().top
        if (pitch > rowHeight) rowHeight = pitch
      }

      const head = region.querySelector('thead')
      const headHeight = head
        ? rendered[0].getBoundingClientRect().top - region.getBoundingClientRect().top
        : 0

      const fits = Math.floor((region.clientHeight - headHeight - 1) / rowHeight)

      setRowsPerPage(Math.min(MAX_ROWS, Math.max(MIN_ROWS, fits)))
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(region)

    return () => observer.disconnect()
  }, [items, showSkeleton])

  const totalPages = Math.ceil(sorted.length / rowsPerPage)

  const page = Math.min(Math.max(query.page, 1), Math.max(totalPages, 1))

  const start = (page - 1) * rowsPerPage
  const pageRows = sorted.slice(start, start + rowsPerPage)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [page])

  const isFiltered = Boolean(query.search || query.status)

  return (
    <div className="list">
      <div className="list__toolbar">
        {searchable && (
          <>
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
          </>
        )}

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
              <option value="">{statusAllLabel}</option>
              {statusOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </>
        )}

        {filters}

        {sortOptions && (
          <div className={`list__sort-field${showSortLabel ? '' : ' list__sort-field--bare'}`}>
            <label
              className={showSortLabel ? 'list__sort-label' : 'visually-hidden'}
              htmlFor={`${fieldId}-sort`}
            >
              {showSortLabel ? 'Order' : sortLabel}
            </label>
            <select
              id={`${fieldId}-sort`}
              className="field field--input list__sort"
              value={query.sort ?? sortOptions[0].value}
              onChange={(event) => onQueryChange({ sort: event.target.value, page: 1 })}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div
        className={`list__rows${isBusy ? ' list__rows--busy' : ''}`}
        aria-busy={isLoading || undefined}
        ref={scrollRef}
      >
        {error ? (
          <p className="muted">Could not load: {error.message}</p>
        ) : showSkeleton ? (
          <TableSkeleton columns={skeletonColumns} rows={rowsPerPage + 2} />
        ) : !hasItems ? null : pageRows.length > 0 ? (
          <div
            className="list__page"
            key={`${query.search ?? ''}|${query.status ?? ''}|${query.sort ?? ''}|${page}`}
          >
            {children(pageRows)}
          </div>
        ) : isFiltered ? (
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
