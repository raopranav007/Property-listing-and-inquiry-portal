import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const { pathname, search } = useLocation()
  // NavLink ignores the query string, so Buy / Rent / All are matched by hand
  const listingType = pathname === '/properties' ? new URLSearchParams(search).get('listingType') : undefined
  const tab = (type) => () => (listingType !== undefined && (listingType || null) === type ? 'active' : '')
  const close = () => setOpen(false)

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-logo" aria-hidden="true">⌂</span>
          HomeLink <span className="brand-sub">Realty</span>
        </Link>

        <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          ☰
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/properties?listingType=Sale" className={tab('Sale')} onClick={close}>Buy</NavLink>
          <NavLink to="/properties?listingType=Rent" className={tab('Rent')} onClick={close}>Rent</NavLink>
          <NavLink to="/properties" className={tab(null)} onClick={close}>All Properties</NavLink>
          {user ? (
            <>
              <NavLink to="/admin" onClick={close}>Dashboard</NavLink>
              <button className="btn btn-outline btn-sm" onClick={() => { logout(); close() }}>Log out</button>
            </>
          ) : (
            <NavLink to="/admin/login" className="btn btn-primary btn-sm" onClick={close}>Broker Login</NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
