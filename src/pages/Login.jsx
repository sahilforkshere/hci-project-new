import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

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
    setTimeout(() => {
      const result = login(form.email, form.password)
      if (result.success) {
        navigate(result.user.isAdmin ? '/dashboard' : '/dashboard')
      } else {
        setError(result.error)
      }
      setLoading(false)
    }, 400)
  }

  const fillDemo = (type) => {
    if (type === 'admin') setForm({ email: 'admin@iiitm.ac.in', password: 'admin123' })
    else setForm({ email: 'sahil@iiitm.ac.in', password: 'student123' })
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
            <button className="btn btn-demo" onClick={() => fillDemo('student')}>👤 Student Demo</button>
            <button className="btn btn-demo" onClick={() => fillDemo('admin')}>🛡️ Admin Demo</button>
          </div>
        </div>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register" className="link">Register here</Link>
        </p>
      </div>
    </div>
  )
}
