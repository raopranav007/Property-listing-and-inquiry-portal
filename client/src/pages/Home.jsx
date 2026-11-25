import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import PropertyCard from '../components/PropertyCard'
import Loader from '../components/Loader'

export default function Home() {
  const navigate = useNavigate()
  const [meta, setMeta] = useState(null)
  const [featured, setFeatured] = useState([])
  const [latest, setLatest] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState({ listingType: 'Sale', city: '', propertyType: '', q: '' })

  useEffect(() => {
    Promise.all([
      api.get('/properties/meta'),
      api.get('/properties', { params: { featured: true, limit: 3, availability: 'Available,Under Offer' } }),
      api.get('/properties', { params: { limit: 6, sort: 'newest' } }),
    ])
      .then(([m, f, l]) => {
        setMeta(m.data)
        setFeatured(f.data.items)
        setLatest(l.data.items)
      })
      .finally(() => setLoading(false))
  }, [])

  const update = (e) => setSearch({ ...search, [e.target.name]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(Object.entries(search).filter(([, v]) => v))
    navigate(`/properties?${params}`)
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Find your next home in your neighbourhood</h1>
          <p className="hero-sub">Verified listings from your local broker – flats, houses, villas, plots, shops and PGs.</p>

          <form className="hero-search" onSubmit={submit}>
            <div className="segmented" role="radiogroup" aria-label="Buy or rent">
              {['Sale', 'Rent'].map((t) => (
                <button
                  type="button"
                  key={t}
                  role="radio"
                  aria-checked={search.listingType === t}
                  className={search.listingType === t ? 'active' : ''}
                  onClick={() => setSearch({ ...search, listingType: t })}
                >
                  {t === 'Sale' ? 'Buy' : 'Rent'}
                </button>
              ))}
            </div>
            <div className="hero-fields">
              <input name="q" value={search.q} onChange={update} placeholder="Search locality, project or keyword" aria-label="Keyword" />
              <select name="city" value={search.city} onChange={update} aria-label="City">
                <option value="">All cities</option>
                {meta?.cities.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select name="propertyType" value={search.propertyType} onChange={update} aria-label="Property type">
                <option value="">All types</option>
                {meta?.propertyTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
              <button className="btn btn-accent">Search</button>
            </div>
          </form>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Featured properties</h2>
          <Link to="/properties">View all →</Link>
        </div>
        {loading ? <Loader /> : (
          <div className="grid">{featured.map((p) => <PropertyCard key={p._id} property={p} />)}</div>
        )}
      </section>

      <section className="container section">
        <h2>Browse by type</h2>
        <div className="type-grid">
          {[
            ['Apartment', '🏢'], ['House', '🏠'], ['Villa', '🏡'], ['Plot', '🗺️'], ['Commercial', '🏬'], ['PG', '🛏️'],
          ].map(([t, icon]) => (
            <Link key={t} to={`/properties?propertyType=${t}`} className="card type-card">
              <span className="type-icon">{icon}</span>{t}
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Recently added</h2>
          <Link to="/properties?sort=newest">See more →</Link>
        </div>
        {loading ? <Loader /> : (
          <div className="grid">{latest.map((p) => <PropertyCard key={p._id} property={p} />)}</div>
        )}
      </section>

      <section className="container section how">
        <h2>How it works</h2>
        <div className="steps">
          <div className="card step"><b>1</b><h4>Search &amp; filter</h4><p className="muted">By location, price, type and availability.</p></div>
          <div className="card step"><b>2</b><h4>View details</h4><p className="muted">Photos, price, location and full description.</p></div>
          <div className="card step"><b>3</b><h4>Send an inquiry</h4><p className="muted">Your request goes straight to the broker.</p></div>
          <div className="card step"><b>4</b><h4>Broker responds</h4><p className="muted">Get a call back and schedule a site visit.</p></div>
        </div>
      </section>
    </>
  )
}
