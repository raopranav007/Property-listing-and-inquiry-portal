import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errorMessage } from '../../api'
import Loader from '../../components/Loader'
import Pagination from '../../components/Pagination'
import { formatPrice, PLACEHOLDER_IMG } from '../../utils/format'

const AVAILABILITY = ['Available', 'Under Offer', 'Sold', 'Rented']

export default function ManageListings() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 })
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/properties', { params: { q: q || undefined, page, limit: 10 } })
      .then((r) => setData(r.data))
      .catch((err) => setMsg({ type: 'error', text: errorMessage(err) }))
      .finally(() => setLoading(false))
  }, [q, page])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  const changeAvailability = async (id, availability) => {
    try {
      await api.patch(`/properties/${id}/availability`, { availability })
      setData((d) => ({ ...d, items: d.items.map((p) => (p._id === id ? { ...p, availability } : p)) }))
      setMsg({ type: 'success', text: `Marked as ${availability}` })
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) })
    }
  }

  const remove = async (p) => {
    if (!window.confirm(`Remove "${p.title}"? Its inquiries will also be deleted. This cannot be undone.`)) return
    try {
      await api.delete(`/properties/${p._id}`)
      setMsg({ type: 'success', text: 'Listing removed' })
      load()
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) })
    }
  }

  return (
    <>
      <div className="section-head">
        <h1 className="h2">Manage listings <span className="muted small">({data.total})</span></h1>
        <Link to="/admin/listings/new" className="btn btn-primary">+ Add listing</Link>
      </div>

      <input
        className="search-input"
        placeholder="Search by title, locality or city…"
        value={q}
        onChange={(e) => { setQ(e.target.value); setPage(1) }}
        aria-label="Search listings"
      />

      {msg.text && <p className={`alert alert-${msg.type}`}>{msg.text}</p>}

      {loading ? <Loader /> : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr><th>Property</th><th>Type</th><th>Price</th><th>Availability</th><th aria-label="Actions" /></tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="table-prop">
                      <img src={p.images[0] || PLACEHOLDER_IMG} alt="" />
                      <div>
                        <Link to={`/properties/${p._id}`} target="_blank">{p.title}</Link>
                        <div className="small muted">{p.location.locality}, {p.location.city}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.propertyType}<br /><span className="small muted">For {p.listingType}</span></td>
                  <td>{formatPrice(p.price, p.listingType)}</td>
                  <td>
                    <select value={p.availability} onChange={(e) => changeAvailability(p._id, e.target.value)} aria-label="Availability">
                      {AVAILABILITY.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </td>
                  <td className="actions">
                    <Link to={`/admin/listings/${p._id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Delete</button>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr><td colSpan={5} className="muted center">No listings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={data.page} pages={data.pages} onChange={setPage} />
    </>
  )
}
