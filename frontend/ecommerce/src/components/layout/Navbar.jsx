import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { useCart } from '../../context/useCart'

const customerLinks = [
  { label: 'Shop', to: '/products' },
  { label: 'About us', to: '/' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { count } = useCart()
  const closeMenu = () => setMenuOpen(false)
  const handleLogout = () => { logout(); closeMenu() }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true">K</span>
          <span>Kitchenly</span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          <span className="sr-only">{menuOpen ? 'Close' : 'Open'} menu</span>
          <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
        </button>
        <nav
          id="primary-navigation"
          className={`primary-navigation${menuOpen ? ' is-open' : ''}`}
          aria-label="Primary navigation"
        >
          {customerLinks.map((link) => (
            <NavLink
              key={link.label}
              className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}
              to={link.to}
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="nav-actions">
            {isAuthenticated ? <><NavLink className="nav-user" to="/profile" onClick={closeMenu}><span className="nav-user-avatar">{user?.name?.slice(0, 2).toUpperCase()}</span>{user?.name}</NavLink><button className="nav-link nav-logout" type="button" onClick={handleLogout}>Log out</button></> : <NavLink className="nav-link nav-link-muted" to="/login" onClick={closeMenu}>Sign in</NavLink>}
            <NavLink className="nav-cart" to="/cart" onClick={closeMenu}>
              Cart <span className="cart-count">{count}</span>
            </NavLink>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar