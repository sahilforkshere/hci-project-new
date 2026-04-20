import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { currentUser, logout, unreadCount } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🎓</span>
          <span className="brand-text">HCI Project</span>
          <span className="brand-sub">IIITM Gwalior</span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span /><span /><span />
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {currentUser ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/complaint/new" className={`nav-link ${isActive('/complaint/new') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>New Complaint</Link>
              <Link to="/complaint/track" className={`nav-link ${isActive('/complaint/track') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Track</Link>
              <Link to="/feedback" className={`nav-link ${isActive('/feedback') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Feedback</Link>
              <Link to="/notifications" className={`nav-link notif-link ${isActive('/notifications') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                🔔
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </Link>
              <Link to="/profile" className="nav-user" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none' }}>
                <span className="user-avatar">{currentUser.name[0]}</span>
                <span className="user-name">{currentUser.name}</span>
                {currentUser.isAdmin && <span className="admin-tag">Admin</span>}
              </Link>
              <button className="btn btn-outline-white btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-white btn-sm" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
