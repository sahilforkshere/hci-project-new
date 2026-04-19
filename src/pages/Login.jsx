import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const DEMO_USERS = [
  { label: '🛡️ Admin', email: 'admin@iiitm.ac.in', password: 'admin123' },
  { label: '👤 Sahil', email: 'sahil@iiitm.ac.in', password: 'student123' },
  { label: '👤 Rohit', email: 'rohit@iiitm.ac.in', password: 'student123' },
  { label: '👤 Aman', email: 'aman@iiitm.ac.in', password: 'student123' },
]

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = login(form.email, form.password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🎓</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-sub">Sign in to your HCI Portal account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email" name="email" value={form.email}
              onChange={handle} required placeholder="you@iiitm.ac.in"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password" name="password" value={form.password}
              onChange={handle} required placeholder="Enter password"
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="demo-section">
          <p className="demo-label">Quick demo login:</p>
          <div className="demo-buttons">
            {DEMO_USERS.map(u => (
              <button
                key={u.email}
                className="btn btn-demo"
                onClick={() => setForm({ email: u.email, password: u.password })}
              >
                {u.label}
              </button>
            ))}
          </div>
          <div className="demo-creds">
            {DEMO_USERS.map(u => (
              <div key={u.email} className="demo-cred-row">
                <span className="demo-cred-name">{u.label}</span>
                <span className="demo-cred-info">{u.email} / {u.password}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register" className="link">Register here</Link>
        </p>
      </div>
    </div>
  )
}
