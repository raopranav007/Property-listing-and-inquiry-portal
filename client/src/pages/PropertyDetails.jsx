import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { errorMessage } from '../api'
import Loader from '../components/Loader'
import StatusBadge from '../components/StatusBadge'
import InquiryForm from '../components/InquiryForm'
import PropertyCard from '../components/PropertyCard'
import { formatPrice, PLACEHOLDER_IMG } from '../utils/format'

export default function PropertyDetails() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [active, setActive] = useState(0)

  useEffect(() => {
    setData(null)
    setError('')
    setActive(0)
    api
      .get(`/properties/${id}`)
      .then((r) => setData(r.data))
      .catch((err) => setError(errorMessage(err)))
    window.scrollTo(0, 0)
  }, [id])

  if (error) {
    return (
      <div className="container section empty card">
        <h2>{error}</h2>
        <Link to="/properties" className="btn btn-primary">Back to listings</Link>
      </div>
    )
  }
  if (!data) return <Loader />

  const { property: p, similar } = data
  const images = p.images.length ? p.images : [PLACEHOLDER_IMG]
  const canInquire = p.availability === 'Available' || p.availability === 'Under Offer'
  const facts = [
    ['Property type', p.propertyType],
    ['Listed for', p.listingType],
    ['Bedrooms', p.bedrooms || '—'],
    ['Bathrooms', p.bathrooms || '—'],
    ['Area', p.areaSqft ? `${p.areaSqft} sq.ft` : '—'],
    ['Furnishing', p.furnishing],
    ['Price / sq.ft', p.listingType === 'Sale' && p.areaSqft ? `₹${Math.round(p.price / p.areaSqft).toLocaleString('en-IN')}` : '—'],
    ['Listed on', new Date(p.createdAt).toLocaleDateString('en-IN')],
  ]

  return (
    <div className="container section">
      <nav className="breadcrumb small">
        <Link to="/">Home</Link> / <Link to="/properties">Properties</Link> / <span>{p.title}</span>
      </nav>

      <div className="details-head">
        <div>
          <h1 className="h2">{p.title}</h1>
          <p className="muted">📍 {[p.location.address, p.location.locality, p.location.city, p.location.pincode].filter(Boolean).join(', ')}</p>
        </div>
        <div className="details-price">
          <p className="price big">{formatPrice(p.price, p.listingType)}</p>
          <StatusBadge status={p.availability} />
        </div>
      </div>

      <div className="details-layout">
        <div>
          <div className="gallery">
            <img
              className="gallery-main"
              src={images[active]}
              alt={`${p.title} – photo ${active + 1}`}
              onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG }}
            />
            {images.length > 1 && (
              <div className="thumbs">
                {images.map((src, i) => (
                  <button key={src + i} className={i === active ? 'active' : ''} onClick={() => setActive(i)} aria-label={`Show photo ${i + 1}`}>
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card section-card">
            <h3>Overview</h3>
            <dl className="facts">
              {facts.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </div>

          <div className="card section-card">
            <h3>Description</h3>
            <p className="description">{p.description}</p>
          </div>

          {p.amenities?.length > 0 && (
            <div className="card section-card">
              <h3>Amenities</h3>
              <ul className="chips">{p.amenities.map((a) => <li key={a}>✓ {a}</li>)}</ul>
            </div>
          )}
        </div>

        <aside className="sticky">
          {canInquire ? (
            <InquiryForm property={p} />
          ) : (
            <div className="card form">
              <h3>This property is {p.availability.toLowerCase()}</h3>
              <p className="muted">Browse similar listings below or search for other properties.</p>
              <Link to={`/properties?city=${p.location.city}&listingType=${p.listingType}`} className="btn btn-primary btn-block">
                See similar properties
              </Link>
            </div>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="section">
          <h2>Similar properties in {p.location.city}</h2>
          <div className="grid">{similar.map((s) => <PropertyCard key={s._id} property={s} />)}</div>
        </section>
      )}
    </div>
  )
}
