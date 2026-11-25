export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>← Prev</button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          className={`btn btn-sm ${n === page ? 'btn-primary' : 'btn-outline'}`}
          aria-current={n === page ? 'page' : undefined}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
      <button className="btn btn-outline btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next →</button>
    </nav>
  )
}
