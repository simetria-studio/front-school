import './PaginationBar.css'

export default function PaginationBar({ meta, onPageChange, loading }) {
  const cur = meta?.current_page ?? 1
  const last = meta?.last_page ?? 1
  if (last <= 1 && !meta?.total) return null

  return (
    <div className="gs-pagination">
      <button
        type="button"
        className="gs-btn gs-btn--ghost gs-btn--sm"
        disabled={loading || cur <= 1}
        onClick={() => onPageChange(cur - 1)}
      >
        Anterior
      </button>
      <span className="gs-pagination-meta">
        {cur} / {last}
      </span>
      <button
        type="button"
        className="gs-btn gs-btn--ghost gs-btn--sm"
        disabled={loading || cur >= last}
        onClick={() => onPageChange(cur + 1)}
      >
        Seguinte
      </button>
    </div>
  )
}
