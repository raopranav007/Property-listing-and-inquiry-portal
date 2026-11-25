import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api, { errorMessage } from '../../api'
import Loader from '../../components/Loader'
import StatusBadge from '../../components/StatusBadge'
import { formatDate, timeAgo } from '../../utils/format'

const STATUSES = ['New', 'Contacted', 'Site Visit Scheduled', 'Closed']

export default function Inquiries() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || ''
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/inquiries', { params: { status: status || undefined, q: q || undefined } })
      .then((r) => setItems(r.data.items))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [status, q])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  const selected = items.find((i) => i._id === selectedId)

  const patch = async (body) => {
    try {
      const { data } = await api.patch(`/inquiries/${selected._id}`, body)
      setItems((list) => list.map((i) => (i._id === data._id ? data : i)))
      setError('')
      return true
    } catch (err) {
      setError(errorMessage(err))
      return false
    }
  }

  const addNote = async (e) => {
    e.preventDefault()
    if (!note.trim()) return
    if (await patch({ note })) setNote('')
  }

  const remove = async () => {
    if (!window.confirm('Delete this inquiry permanently?')) return
    try {
      await api.delete(`/inquiries/${selected._id}`)
      setItems((list) => list.filter((i) => i._id !== selected._id))
      setSelectedId(null)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <>
      <h1 className="h2">Customer inquiries</h1>

      <div className="tabs" role="tablist">
        {['', ...STATUSES].map((s) => (
          <button
            key={s || 'all'}
            role="tab"
            aria-selected={status === s}
            className={status === s ? 'active' : ''}
            onClick={() => setParams(s ? { status: s } : {})}
          >
            {s || 'All'}
          </button>
        ))}
      </div>
      <input className="search-input" placeholder="Search by name, email, phone or message…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search inquiries" />
      {error && <p className="alert alert-error">{error}</p>}

      <div className="inbox">
        <div className="card inbox-list">
          {loading ? <Loader /> : items.length === 0 ? (
            <p className="muted center pad">No inquiries found.</p>
          ) : (
            items.map((i) => (
              <button key={i._id} className={`inbox-item ${i._id === selectedId ? 'active' : ''}`} onClick={() => setSelectedId(i._id)}>
                <div className="inbox-top">
                  <strong>{i.name}</strong>
                  <span className="small muted">{timeAgo(i.createdAt)}</span>
                </div>
                <div className="small">{i.property?.title || 'Property removed'}</div>
                <div className="inbox-bottom">
                  <StatusBadge status={i.status} />
                  <span className="small muted ellipsis">{i.message}</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="card inbox-detail">
          {!selected ? (
            <p className="muted center pad">Select an inquiry to view details and respond.</p>
          ) : (
            <>
              <div className="section-head">
                <div>
                  <h3>{selected.name}</h3>
                  <p className="small muted">Received {formatDate(selected.createdAt)}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              <dl className="facts">
                <div><dt>Phone</dt><dd><a href={`tel:${selected.phone}`}>{selected.phone}</a></dd></div>
                <div><dt>Email</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd></div>
                <div><dt>Prefers</dt><dd>{selected.preferredContact}</dd></div>
                <div>
                  <dt>Property</dt>
                  <dd>{selected.property ? <Link to={`/properties/${selected.property._id}`} target="_blank">{selected.property.title}</Link> : 'Removed'}</dd>
                </div>
              </dl>

              <blockquote className="message">{selected.message}</blockquote>

              <div className="contact-actions">
                <a className="btn btn-outline btn-sm" href={`tel:${selected.phone}`}>📞 Call</a>
                <a className="btn btn-outline btn-sm" href={`https://wa.me/${selected.phone.replace(/\D/g, '').replace(/^(\d{10})$/, '91$1')}`} target="_blank" rel="noreferrer">💬 WhatsApp</a>
                <a className="btn btn-outline btn-sm" href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.property?.title || 'Your property inquiry'}`)}`}>✉️ Email</a>
              </div>

              <label>
                Update status
                <select value={selected.status} onChange={(e) => patch({ status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>

              <h4>Follow-up notes</h4>
              {selected.notes.length === 0 ? (
                <p className="small muted">No notes yet.</p>
              ) : (
                <ul className="notes">
                  {selected.notes.map((n) => (
                    <li key={n._id}>
                      <p>{n.text}</p>
                      <span className="small muted">{n.author} · {formatDate(n.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <form className="note-form" onSubmit={addNote}>
                <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note, e.g. called customer, site visit fixed…" aria-label="New note" />
                <button className="btn btn-primary btn-sm">Add note</button>
              </form>

              <button className="btn btn-danger btn-sm" onClick={remove}>Delete inquiry</button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
