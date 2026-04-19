import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'Chemical Engg', 'IMT', 'MBBS', 'Other']
const YEARS = ['1st', '2nd', '3rd', '4th', '5th']

export default function Register() {
  const { register } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', rollNo: '', department: '', year: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setTimeout(() => {
      const { confirm, ...data } = form
      const result = register(data)
      if (result.success) navigate('/dashboard')
      else setError(result.error)
      setLoading(false)
    }, 400)
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-logo">🎓</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-sub">Join the HCI Student Complaint Portal</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handle} required placeholder="Rahul Sharma" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input type="text" name="rollNo" value={form.rollNo} onChange={handle} required placeholder="2023IMT-069" className="form-input" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select name="department" value={form.department} onChange={handle} required className="form-input">
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <select name="year" value={form.year} onChange={handle} required className="form-input">
                <option value="">Select Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y} Year</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Institute Email</label>
            <input type="email" name="email" value={form.email} onChange={handle} required placeholder="you@iiitm.ac.in" className="form-input" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" value={form.password} onChange={handle} required placeholder="Min. 6 characters" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" name="confirm" value={form.confirm} onChange={handle} required placeholder="Repeat password" className="form-input" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login" className="link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
