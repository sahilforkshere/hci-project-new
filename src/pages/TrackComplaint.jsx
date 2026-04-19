import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const STATUS_ORDER = ['Submitted', 'Assigned', 'Under Review', 'Escalated', 'Resolved']
const STATUS_COLORS = { Submitted: 'badge-info', Assigned: 'badge-warning', 'Under Review': 'badge-orange', Escalated: 'badge-danger', Resolved: 'badge-success' }
const PRIORITY_COLORS = { Low: 'badge-success', Medium: 'badge-warning', High: 'badge-orange', Critical: 'badge-danger' }

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso)
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  if (m > 0) return `${m}m ago`
  return 'just now'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ComplaintDetail({ complaint, onEscalate, onVote }) {
  const stageIndex = STATUS_ORDER.indexOf(complaint.status)
  const daysSinceUpdate = Math.floor((Date.now() - new Date(complaint.updatedAt)) / 86400000)
  const canEscalate = complaint.status !== 'Resolved' && complaint.status !== 'Escalated' && daysSinceUpdate >= 3

  return (
    <div className="complaint-detail">
      <div className="detail-header">
        <div>
          <div className="detail-id-row">
            <span className="detail-id">{complaint.id}</span>
            <span className={`badge ${STATUS_COLORS[complaint.status] || 'badge-neutral'}`}>{complaint.status}</span>
            <span className={`badge ${PRIORITY_COLORS[complaint.priority] || 'badge-neutral'}`}>{complaint.priority}</span>
            {complaint.isSafety && <span className="badge badge-danger">🚨 Safety</span>}
            {complaint.isAnonymous && <span className="badge badge-info">🔒 Anonymous</span>}
          </div>
          <h2 className="detail-title">{complaint.title}</h2>
          <p className="detail-meta">{complaint.category} › {complaint.subcategory} · Filed {timeAgo(complaint.createdAt)}</p>
        </div>
        <div className="detail-vote">
          <button className="vote-btn" onClick={() => onVote(complaint.id)}>👍</button>
          <span className="vote-count">{complaint.votes}</span>
          <span className="vote-label">students agree</span>
        </div>
      </div>

      <p className="detail-description">{complaint.description}</p>

      {complaint.assignedTo && (
        <div className="assigned-box">
          <span>📌 Assigned to: <strong>{complaint.assignedTo}</strong></span>
        </div>
      )}

      {/* Status Progress Bar */}
      <div className="progress-section">
        <h3 className="progress-title">Complaint Progress</h3>
        <div className="progress-track">
          {['Submitted', 'Assigned', 'Under Review', 'Resolved'].map((stage, i) => {
            const currentIdx = complaint.status === 'Escalated' ? 2.5 : STATUS_ORDER.indexOf(complaint.status)
            const isDone = i < currentIdx || (complaint.status !== 'Escalated' && STATUS_ORDER.indexOf(complaint.status) > i)
            const isCurrent = STATUS_ORDER.indexOf(complaint.status) === i || (complaint.status === 'Escalated' && i === 2)
            return (
              <div key={stage} className="progress-step-wrap">
                <div className={`progress-circle ${isDone ? 'done' : isCurrent ? 'current' : ''}`}>
                  {isDone ? '✓' : i + 1}
                </div>
                <span className={`progress-label ${isCurrent ? 'active' : ''}`}>{stage}</span>
                {i < 3 && <div className={`progress-line ${isDone ? 'done' : ''}`} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline-section">
        <h3 className="timeline-title">Activity Timeline</h3>
        <div className="timeline">
          {[...complaint.statusHistory].reverse().map((h, i) => (
            <div key={i} className={`timeline-item ${i === 0 ? 'latest' : ''}`}>
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-stage-row">
                  <span className={`badge ${STATUS_COLORS[h.stage] || 'badge-neutral'}`}>{h.stage}</span>
                  <span className="timeline-time">{formatDate(h.time)}</span>
                </div>
                <p className="timeline-note">{h.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escalation */}
      {canEscalate && (
        <div className="escalate-box">
          <div>
            <p className="escalate-title">⚠️ No action for {daysSinceUpdate} days</p>
            <p className="escalate-sub">If your complaint has been untouched, you can escalate it to a higher authority without filing a new complaint.</p>
          </div>
          <button className="btn btn-danger" onClick={() => onEscalate(complaint.id)}>Escalate</button>
        </div>
      )}
    </div>
  )
}

export default function TrackComplaint() {
  const { myComplaints, escalateComplaint, voteComplaint } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')

  const statuses = ['All', 'Submitted', 'Assigned', 'Under Review', 'Escalated', 'Resolved']

  const filtered = myComplaints.filter(c => {
    const matchStatus = filter === 'All' || c.status === filter
    const matchSearch = !search || c.id.toLowerCase().includes(search.toLowerCase()) || c.title.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const selectedComplaint = selected ? myComplaints.find(c => c.id === selected) : null

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Track Complaints</h1>
          <p className="page-sub">Monitor the status of your complaints in real time.</p>
        </div>

        {selectedComplaint ? (
          <div>
            <button className="btn btn-ghost mb-4" onClick={() => setSelected(null)}>← Back to list</button>
            <ComplaintDetail
              complaint={selectedComplaint}
              onEscalate={(id) => { escalateComplaint(id); setSelected(null) }}
              onVote={voteComplaint}
            />
          </div>
        ) : (
          <div>
            {/* Search + Filter */}
            <div className="filter-bar">
              <input
                type="text" placeholder="Search by ID or title…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="form-input search-input"
              />
              <div className="filter-tabs">
                {statuses.map(s => (
                  <button key={s} className={`filter-tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                    {s}
                    <span className="filter-count">{s === 'All' ? myComplaints.length : myComplaints.filter(c => c.status === s).length}</span>
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <p className="empty-icon">📭</p>
                <p className="empty-title">{myComplaints.length === 0 ? 'No complaints yet' : 'No complaints match your filter'}</p>
                {myComplaints.length === 0 && (
                  <button className="btn btn-primary" onClick={() => navigate('/complaint/new')}>File First Complaint</button>
                )}
              </div>
            ) : (
              <div className="complaint-list">
                {filtered.map(c => (
                  <div key={c.id} className="complaint-card" onClick={() => setSelected(c.id)}>
                    <div className="complaint-card-top">
                      <div className="complaint-card-meta">
                        <span className="complaint-card-id">{c.id}</span>
                        <span className={`badge ${STATUS_COLORS[c.status] || 'badge-neutral'}`}>{c.status}</span>
                        <span className={`badge ${PRIORITY_COLORS[c.priority] || 'badge-neutral'}`}>{c.priority}</span>
                        {c.isSafety && <span className="badge badge-danger">🚨</span>}
                        {c.isAnonymous && <span className="badge badge-info">🔒</span>}
                      </div>
                      <span className="complaint-card-date">{timeAgo(c.createdAt)}</span>
                    </div>
                    <h3 className="complaint-card-title">{c.title}</h3>
                    <p className="complaint-card-cat">{c.category} › {c.subcategory}</p>
                    <div className="complaint-card-footer">
                      <span className="complaint-votes">👍 {c.votes} agree</span>
                      {c.assignedTo && <span className="complaint-assigned">📌 {c.assignedTo}</span>}
                      <span className="view-link">View details →</span>
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
