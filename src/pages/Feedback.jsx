import { useState } from 'react'
import { useApp } from '../context/AppContext'

const TARGETS = {
  Faculty: ['Prof. Sharma — Data Structures', 'Prof. Mehta — Algorithms', 'Prof. Singh — Networks', 'Prof. Verma — DBMS', 'Prof. Gupta — OS', 'Other Faculty'],
  Infrastructure: ['Computer Labs', 'Library', 'Classrooms', 'Sports Facilities', 'Auditorium', 'Common Areas'],
  'Hostel & Mess': ['Main Mess', 'North Hostel', 'South Hostel', 'Night Canteen', 'Laundry Services'],
  Administrative: ['Academic Section', 'Fee Counter', 'Examination Cell', 'Student Affairs', 'Placement Cell'],
  'Course Content': ['Syllabus Relevance', 'Exam Pattern', 'Course Material', 'Lab Sessions', 'Project Guidance'],
}

const ASPECTS = {
  Faculty: ['Good explanations', 'Approachable', 'Punctual', 'Fair evaluation', 'Inspiring', 'Needs improvement', 'Difficult to follow', 'Too fast-paced'],
  Infrastructure: ['Well maintained', 'Clean', 'Adequate capacity', 'Good equipment', 'Poor condition', 'Overcrowded', 'Needs repair'],
  'Hostel & Mess': ['Good food quality', 'Hygienic', 'Variety', 'Timely service', 'Poor food quality', 'Unhygienic', 'Limited options', 'Slow service'],
  Administrative: ['Responsive', 'Helpful', 'Efficient', 'Slow processing', 'Unhelpful', 'Needs improvement'],
  'Course Content': ['Well-structured', 'Relevant', 'Good resources', 'Too theoretical', 'Needs more practice', 'Outdated material'],
}

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
  return (
    <div>
      <div className="star-row">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n} type="button"
            className={`star ${n <= (hover || value) ? 'filled' : ''}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
          >★</button>
        ))}
        {(hover || value) > 0 && <span className="star-label">{labels[hover || value]}</span>}
      </div>
    </div>
  )
}

export default function Feedback() {
  const { submitFeedback, feedbackList, currentUser } = useApp()
  const [targetType, setTargetType] = useState('')
  const [targetName, setTargetName] = useState('')
  const [rating, setRating] = useState(0)
  const [selectedAspects, setSelectedAspects] = useState([])
  const [comment, setComment] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('submit')

  const toggleAspect = (a) => setSelectedAspects(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  const canSubmit = targetType && targetName && rating > 0

  const submit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setTimeout(() => {
      submitFeedback({ targetType, targetName, rating, aspects: selectedAspects, comment, isAnonymous })
      setSubmitted(true)
      setLoading(false)
    }, 400)
  }

  const reset = () => {
    setTargetType(''); setTargetName(''); setRating(0); setSelectedAspects([]); setComment(''); setSubmitted(false)
  }

  const myFeedback = feedbackList.filter(f => f.userId === currentUser.id)

  return (
    <div className="page">
      <div className="container container-sm">
        <div className="page-header">
          <h1 className="page-title">Feedback</h1>
          <p className="page-sub">Share your experience to help improve the institution. Your feedback drives real change.</p>
        </div>

        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'submit' ? 'active' : ''}`} onClick={() => setTab('submit')}>Submit Feedback</button>
          <button className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
            My History <span className="tab-count">{myFeedback.length}</span>
          </button>
        </div>

        {tab === 'submit' && (
          <>
            {submitted ? (
              <div className="success-card">
                <div className="success-icon">💬</div>
                <h2 className="success-title">Feedback Submitted!</h2>
                <p className="success-sub">Thank you for helping us improve. Your feedback has been recorded.</p>
                {isAnonymous && (
                  <div className="info-box">
                    <p>🔒 Submitted anonymously. Your identity is not linked to this feedback.</p>
                  </div>
                )}
                <div className="success-actions">
                  <button className="btn btn-primary" onClick={reset}>Submit Another</button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="card">
                <h2 className="step-title">What would you like to rate?</h2>

                {/* Target Type */}
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <div className="category-grid-sm">
                    {Object.keys(TARGETS).map(t => (
                      <button key={t} type="button"
                        className={`category-btn-sm ${targetType === t ? 'selected' : ''}`}
                        onClick={() => { setTargetType(t); setTargetName(''); setSelectedAspects([]) }}>
                        {t === 'Faculty' && '👨‍🏫'}
                        {t === 'Infrastructure' && '🏗️'}
                        {t === 'Hostel & Mess' && '🍽️'}
                        {t === 'Administrative' && '📋'}
                        {t === 'Course Content' && '📚'}
                        <span>{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {targetType && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Specific {targetType}</label>
                      <select value={targetName} onChange={e => setTargetName(e.target.value)} className="form-input" required>
                        <option value="">Select…</option>
                        {TARGETS[targetType].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Overall Rating</label>
                      <StarRating value={rating} onChange={setRating} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">What specifically? <span className="optional">(optional — select all that apply)</span></label>
                      <div className="aspect-grid">
                        {ASPECTS[targetType]?.map(a => (
                          <button key={a} type="button"
                            className={`aspect-btn ${selectedAspects.includes(a) ? 'selected' : ''}`}
                            onClick={() => toggleAspect(a)}>
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Additional Comments <span className="optional">(optional)</span></label>
                      <textarea value={comment} onChange={e => setComment(e.target.value)}
                        placeholder="Any specific suggestions or observations…"
                        className="form-input form-textarea" rows={3} maxLength={500} />
                      <span className="char-count">{comment.length}/500</span>
                    </div>

                    <div className="toggle-card">
                      <div className="toggle-info">
                        <span className="toggle-icon">🔒</span>
                        <div>
                          <p className="toggle-title">Submit Anonymously</p>
                          <p className="toggle-desc">Your name will not be visible to faculty or administration. Default is anonymous.</p>
                        </div>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                        <span className="toggle-slider" />
                      </label>
                    </div>

                    {isAnonymous && (
                      <div className="anonymity-notice">
                        <span>🔐</span>
                        <p>Your identity has been separated from this feedback. The reviewer will see only your department and year.</p>
                      </div>
                    )}

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                      <button type="submit" className="btn btn-primary btn-full" disabled={!canSubmit || loading}>
                        {loading ? 'Submitting…' : '💬 Submit Feedback'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </>
        )}

        {tab === 'history' && (
          <div>
            {myFeedback.length === 0 ? (
              <div className="empty-state">
                <p className="empty-icon">💬</p>
                <p className="empty-title">No feedback submitted yet</p>
                <button className="btn btn-primary" onClick={() => setTab('submit')}>Submit Feedback</button>
              </div>
            ) : (
              <div className="feedback-list">
                {[...myFeedback].reverse().map(fb => (
                  <div key={fb.id} className="feedback-card">
                    <div className="feedback-card-header">
                      <div>
                        <span className="feedback-target-type">{fb.targetType}</span>
                        <span className="feedback-target-name">{fb.targetName}</span>
                      </div>
                      <div className="feedback-stars">
                        {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                        <span className="feedback-rating-num">{fb.rating}/5</span>
                      </div>
                    </div>
                    {fb.aspects?.length > 0 && (
                      <div className="feedback-aspects">
                        {fb.aspects.map(a => <span key={a} className="aspect-tag">{a}</span>)}
                      </div>
                    )}
                    {fb.comment && <p className="feedback-comment">"{fb.comment}"</p>}
                    <div className="feedback-card-footer">
                      {fb.isAnonymous && <span className="badge badge-info">🔒 Anonymous</span>}
                      <span className="feedback-date">{new Date(fb.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
