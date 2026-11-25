import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errorMessage } from '../../api'
import Loader from '../../components/Loader'
import StatusBadge from '../../components/StatusBadge'
import { timeAgo } from '../../utils/format'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/inquiries/stats'), api.get('/inquiries')])
      .then(([s, i]) => {
        setStats(s.data)
        setRecent(i.data.items.slice(0, 5))
      })
      .catch((err) => setError(errorMessage(err)))
  }, [])

  if (error) return <p className="alert alert-error">{error}</p>
  if (!stats) return <Loader />

  const cards = [
    ['Total listings', stats.totalProperties, '/admin/listings'],
    ['Available', stats.availability.Available || 0, '/admin/listings'],
    ['Total inquiries', stats.totalInquiries, '/admin/inquiries'],
    ['New inquiries', stats.inquiries.New || 0, '/admin/inquiries?status=New'],
  ]

  return (
    <>
      <div className="section-head">
        <h1 className="h2">Dashboard</h1>
        <Link to="/admin/listings/new" className="btn btn-primary">+ Add listing</Link>
      </div>

      <div className="stats">
        {cards.map(([label, value, to]) => (
          <Link key={label} to={to} className="card stat">
            <span className="stat-value">{value}</span>
            <span className="muted">{label}</span>
          </Link>
        ))}
      </div>

      <div className="two-col">
        <div className="card section-card">
          <h3>Inquiries by status</h3>
          <ul className="bars">
            {['New', 'Contacted', 'Site Visit Scheduled', 'Closed'].map((s) => {
              const n = stats.inquiries[s] || 0
              const pct = stats.totalInquiries ? (n / stats.totalInquiries) * 100 : 0
              return (
                <li key={s}>
                  <span>{s}</span>
                  <span className="bar"><span style={{ width: `${pct}%` }} /></span>
                  <b>{n}</b>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="card section-card">
          <h3>Listings by availability</h3>
          <ul className="bars">
            {['Available', 'Under Offer', 'Sold', 'Rented'].map((s) => {
              const n = stats.availability[s] || 0
              const pct = stats.totalProperties ? (n / stats.totalProperties) * 100 : 0
              return (
                <li key={s}>
                  <span>{s}</span>
                  <span className="bar"><span style={{ width: `${pct}%` }} /></span>
                  <b>{n}</b>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="card section-card">
        <div className="section-head">
          <h3>Latest inquiries</h3>
          <Link to="/admin/inquiries">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="muted">No inquiries yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Customer</th><th>Property</th><th>Status</th><th>Received</th></tr></thead>
              <tbody>
                {recent.map((i) => (
                  <tr key={i._id}>
                    <td>{i.name}<br /><span className="small muted">{i.phone}</span></td>
                    <td>{i.property?.title || <em className="muted">Removed</em>}</td>
                    <td><StatusBadge status={i.status} /></td>
                    <td className="small">{timeAgo(i.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
