import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <strong>HomeLink Realty</strong>
          <p className="muted">Your trusted local property broker – homes, rentals, plots and commercial spaces.</p>
        </div>
        <div>
          <strong>Explore</strong>
          <ul>
            <li><Link to="/properties?listingType=Sale">Properties for sale</Link></li>
            <li><Link to="/properties?listingType=Rent">Properties for rent</Link></li>
            <li><Link to="/admin/login">Broker login</Link></li>
          </ul>
        </div>
        <div>
          <strong>Contact</strong>
          <ul className="muted">
            <li>📞 +91 98765 43210</li>
            <li>✉️ contact@homelink.example</li>
            <li>📍 Sector 62, Noida</li>
          </ul>
        </div>
      </div>
      <p className="footer-bottom">
        © {new Date().getFullYear()} Property Listing &amp; Inquiry Portal · Built with React, Node.js, Express &amp; MongoDB
      </p>
    </footer>
  )
}
