import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link className="brand" to="/">
            <span className="brand-mark" aria-hidden="true">K</span>
            <span>Kitchenly</span>
          </Link>
          <p>Thoughtful tools for better everyday cooking.</p>
        </div>
        <div className="footer-links" aria-label="Footer navigation">
          <Link to="/products">Shop all</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/admin">Admin</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Kitchenly</span>
        <span>Made for the heart of the home.</span>
      </div>
    </footer>
  )
}

export default Footer