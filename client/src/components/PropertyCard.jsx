import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { formatPrice, PLACEHOLDER_IMG } from '../utils/format'

export default function PropertyCard({ property }) {
  const { _id, title, price, listingType, propertyType, availability, location, bedrooms, bathrooms, areaSqft, images } = property
  return (
    <Link to={`/properties/${_id}`} className="card property-card">
      <div className="card-img">
        <img
          src={images?.[0] || PLACEHOLDER_IMG}
          alt={title}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG }}
        />
        <span className={`tag tag-${listingType.toLowerCase()}`}>For {listingType}</span>
        <span className="card-status"><StatusBadge status={availability} /></span>
      </div>
      <div className="card-body">
        <p className="price">{formatPrice(price, listingType)}</p>
        <h3 className="card-title">{title}</h3>
        <p className="muted small">📍 {location.locality}, {location.city}</p>
        <div className="specs">
          <span>{propertyType}</span>
          {bedrooms > 0 && <span>🛏 {bedrooms} Bed</span>}
          {bathrooms > 0 && <span>🛁 {bathrooms} Bath</span>}
          {areaSqft > 0 && <span>📐 {areaSqft} sq.ft</span>}
        </div>
      </div>
    </Link>
  )
}
