import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const CATEGORIES = {
  Academic: ['Assessment Fairness', 'Syllabus Coverage', 'Exam Scheduling', 'Grade Dispute', 'Faculty Accessibility', 'Other Academic'],
  Infrastructure: ['Lab Equipment', 'Electrical Issues', 'Water Supply', 'Safety Apparatus', 'Internet / Wi-Fi', 'Classroom Facilities', 'Other Infrastructure'],
  'Hostel & Mess': ['Mess Food Quality', 'Mess Hygiene', 'Water Supply (Hostel)', 'Furniture & Fixtures', 'Cleanliness & Pest Control', 'Night Canteen', 'Security & Access', 'Other Hostel'],
  Administrative: ['Fee & Finance', 'Document Processing', 'Portal / System Issues', 'Scheduling & Timetable', 'Other Administrative'],
  'Faculty Conduct': ['Unprofessional Behaviour', 'Attendance Marking', 'Evaluation Bias', 'Communication Issues', 'Other Faculty'],
  Wellbeing: ['Mental Health Support', 'Physical Health Facilities', 'Ragging / Bullying', 'Discrimination', 'Workload & Stress', 'Other Wellbeing'],
}

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const PRIORITY_COLORS = { Low: 'badge-success', Medium: 'badge-warning', High: 'badge-orange', Critical: 'badge-danger' }

const STEPS = ['Category', 'Details', 'Options', 'Review']

export default function NewComplaint() {
  const { submitComplaint } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', isSafety: false, isAnonymous: false })
  const [submittedId, setSubmittedId] = useState(null)
  const [loading, setLoading] = useState(false)

  const handle = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const canNext = () => {
    if (step === 0) return category && subcategory
    if (step === 1) return form.title.trim().length > 5 && form.description.trim().length > 10
    return true
  }

  const submit = () => {
    setLoading(true)
    setTimeout(() => {
      const result = submitComplaint({ category, subcategory, ...form })
      if (result.success) setSubmittedId(result.id)
      setLoading(false)
    }, 500)
  }

  if (submittedId) {
    return (
      <div className="page">
        <div className="container container-sm">
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h2 className="success-title">Complaint Submitted!</h2>
            <p className="success-sub">Your complaint has been received and logged.</p>
            <div className="complaint-id-box">
              <span className="complaint-id-label">Complaint ID</span>
              <span className="complaint-id">{submittedId}</span>
            </div>
            <div className="info-box">
              <p>📋 You will receive notifications as your complaint progresses through review stages.</p>
              {form.isSafety && <p>🚨 Safety flag detected — expedited 24-hour response SLA applied.</p>}
              {form.isAnonymous && <p>🔒 Your identity has been separated from this complaint. Reviewers will see only your department and year.</p>}
            </div>
            <div className="success-actions">
              <button className="btn btn-primary" onClick={() => navigate('/complaint/track')}>Track Status</button>
              <button className="btn btn-outline" onClick={() => { setSubmittedId(null); setStep(0); setCategory(''); setSubcategory(''); setForm({ title: '', description: '', priority: 'Medium', isSafety: false, isAnonymous: false }) }}>
                New Complaint
              </button>
              <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container container-sm">
        <div className="page-header">
          <h1 className="page-title">New Complaint</h1>
          <p className="page-sub">Submit a complaint or raise a concern — we&apos;ll make sure it reaches the right person.</p>
        </div>

        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={s} className={`step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
              <div className="step-circle">{i < step ? '✓' : i + 1}</div>
              <span className="step-label">{s}</span>
              {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        <div className="card">
          {/* Step 0: Category */}
          {step === 0 && (
            <div>
              <h2 className="step-title">Select Category</h2>
              <p className="step-sub">What type of issue are you reporting?</p>
              <div className="category-grid">
                {Object.keys(CATEGORIES).map(cat => (
                  <button
                    key={cat}
                    className={`category-btn ${category === cat ? 'selected' : ''}`}
                    onClick={() => { setCategory(cat); setSubcategory('') }}
                  >
                    {cat === 'Academic' && '📚'}
                    {cat === 'Infrastructure' && '🏗️'}
                    {cat === 'Hostel & Mess' && '🏠'}
                    {cat === 'Administrative' && '📋'}
                    {cat === 'Faculty Conduct' && '👨‍🏫'}
                    {cat === 'Wellbeing' && '💚'}
                    <span>{cat}</span>
                  </button>
                ))}
              </div>

              {category && (
                <div className="subcategory-section">
                  <h3 className="subcategory-title">Select Sub-category</h3>
                  <div className="subcategory-grid">
                    {CATEGORIES[category].map(sub => (
                      <button
                        key={sub}
                        className={`subcategory-btn ${subcategory === sub ? 'selected' : ''}`}
                        onClick={() => setSubcategory(sub)}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div>
              <h2 className="step-title">Complaint Details</h2>
              <p className="step-sub">Describe your issue clearly. More detail = faster resolution.</p>
              <div className="form-group">
                <label className="form-label">Title <span className="required">*</span></label>
                <input type="text" name="title" value={form.title} onChange={handle} placeholder="Brief summary of the issue" className="form-input" maxLength={100} />
                <span className="char-count">{form.title.length}/100</span>
              </div>
              <div className="form-group">
                <label className="form-label">Description <span className="required">*</span></label>
                <textarea name="description" value={form.description} onChange={handle} placeholder="Describe the problem in detail. Include location, dates, and any previous attempts to resolve it." className="form-input form-textarea" rows={5} maxLength={1000} />
                <span className="char-count">{form.description.length}/1000</span>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <div className="priority-grid">
                  {PRIORITIES.map(p => (
                    <button
                      key={p}
                      type="button"
                      className={`priority-btn ${form.priority === p ? 'selected ' + PRIORITY_COLORS[p] : ''}`}
                      onClick={() => setForm({ ...form, priority: p })}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <p className="hint">Note: The system may cap priority to prevent misuse. Safety-critical issues should use the safety flag below.</p>
              </div>
            </div>
          )}

          {/* Step 2: Options */}
          {step === 2 && (
            <div>
              <h2 className="step-title">Submission Options</h2>
              <p className="step-sub">Configure privacy and safety settings for your complaint.</p>

              <div className="toggle-card">
                <div className="toggle-info">
                  <span className="toggle-icon">🚨</span>
                  <div>
                    <p className="toggle-title">Safety Concern</p>
                    <p className="toggle-desc">Mark this if the issue poses a physical safety risk. Triggers 24-hour response SLA instead of standard 5-day window.</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" name="isSafety" checked={form.isSafety} onChange={handle} />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="toggle-card">
                <div className="toggle-info">
                  <span className="toggle-icon">🔒</span>
                  <div>
                    <p className="toggle-title">Submit Anonymously</p>
                    <p className="toggle-desc">Your identity will be separated from the complaint at the storage level. Reviewers will see only your department and year.</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" name="isAnonymous" checked={form.isAnonymous} onChange={handle} />
                  <span className="toggle-slider" />
                </label>
              </div>

              {form.isAnonymous && (
                <div className="anonymity-notice">
                  <span>🔐</span>
                  <p><strong>Anonymity confirmed.</strong> Your identity has been separated from this complaint. The reviewer will see only your department and year — not your name or roll number.</p>
                </div>
              )}

              {form.isSafety && (
                <div className="safety-notice">
                  <span>⚡</span>
                  <p><strong>Safety flag active.</strong> This complaint will trigger a maximum 24-hour response SLA and be routed to the appropriate authority immediately.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div>
              <h2 className="step-title">Review &amp; Submit</h2>
              <p className="step-sub">Confirm your complaint details before submitting.</p>
              <div className="review-grid">
                <div className="review-row">
                  <span className="review-label">Category</span>
                  <span className="review-value">{category} → {subcategory}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Title</span>
                  <span className="review-value">{form.title}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Description</span>
                  <span className="review-value review-desc">{form.description}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Priority</span>
                  <span className={`badge ${PRIORITY_COLORS[form.priority]}`}>{form.priority}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Safety Flag</span>
                  <span className={`badge ${form.isSafety ? 'badge-danger' : 'badge-neutral'}`}>{form.isSafety ? '🚨 Yes — 24hr SLA' : 'No'}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Anonymous</span>
                  <span className={`badge ${form.isAnonymous ? 'badge-info' : 'badge-neutral'}`}>{form.isAnonymous ? '🔒 Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="step-nav">
            {step > 0 && (
              <button className="btn btn-outline" onClick={() => setStep(step - 1)}>← Back</button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!canNext()}>
                Next →
              </button>
            ) : (
              <button className="btn btn-primary" onClick={submit} disabled={loading}>
                {loading ? 'Submitting…' : '📤 Submit Complaint'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
