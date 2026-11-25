import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout() {
  const { user } = useAuth()
  return (
    <div className="container section admin-layout">
      <aside className="card admin-nav">
        <p className="small muted">Signed in as</p>
        <p><strong>{user.name}</strong></p>
        <nav>
          <NavLink to="/admin" end>📊 Dashboard</NavLink>
          <NavLink to="/admin/listings" end>🏘️ Listings</NavLink>
          <NavLink to="/admin/listings/new">➕ Add listing</NavLink>
          <NavLink to="/admin/inquiries">📨 Inquiries</NavLink>
        </nav>
      </aside>
      <section className="admin-content">
        <Outlet />
      </section>
    </div>
  )
}
