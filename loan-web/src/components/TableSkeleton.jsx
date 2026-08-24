import Skeleton from './Skeleton.jsx'
import './TableSkeleton.css'

function cells(columns) {
  return Array.from({ length: columns }, (_, column) => (
    <Skeleton key={column} variant="text" />
  ))
}

function TableSkeleton({ columns = 5, rows = 10 }) {
  return (
    <div className="tskel" aria-hidden="true" style={{ '--tskel-cols': String(columns) }}>
      <div className="tskel__row tskel__row--head">{cells(columns)}</div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="tskel__row">
          {cells(columns)}
        </div>
      ))}
    </div>
  )
}

export default TableSkeleton
