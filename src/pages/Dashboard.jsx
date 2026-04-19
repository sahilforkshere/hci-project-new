import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const STATUS_COLORS = { Submitted: 'badge-info', Assigned: 'badge-warning', 'Under Review': 'badge-orange', Escalated: 'badge-danger', Resolved: 'badge-success' }
const PRIORITY_COLORS = { Low: 'badge-success', Medium: 'badge-warning', High: 'badge-orange', Critical: 'badge-danger' }
const STATUS_ORDER = ['Submitted', 'Assigned', 'Under Review', 'Resolved']

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso)
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`; if (h > 0) return `${h}h ago`; if (m > 0) return `${m}m ago`; return 'just now'
}

function AdminStatusModal({ complaint, onClose, onUpdate }) {
  const [status, setStatus] = useState(complaint.status)
  const [note, setNote] = useState('')
  const [assignedTo, setAssignedTo] = useState(complaint.assignedTo || '')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Update Status — {complaint.id}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">New Status</label>
            <div className="status-options">
              {STATUS_ORDER.map(s => (
                <button key={s} type="button"
                  className={`status-option ${status === s ? 'selected ' + (STATUS_COLORS[s] || '') : ''}`}
                  onClick={() => setStatus(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Assigned To</label>
            <input type="text" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="e.g. IT Department" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Resolution Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Describe the action taken or next steps…" className="form-input form-textarea" rows={3} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onUpdate(complaint.id, status, note || `Status updated to ${status}.`, assignedTo); onClose() }}>
            Update Status
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { currentUser, myComplaints, complaints, updateStatus, escalateComplaint } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [editingComplaint, setEditingComplaint] = useState(null)

  const allComplaints = currentUser?.isAdmin ? complaints : myComplaints

  const stats = {
    total: allComplaints.length,
    pending: allComplaints.filter(c => c.status !== 'Resolved').length,
    resolved: allComplaints.filter(c => c.status === 'Resolved').length,
    critical: allComplaints.filter(c => c.priority === 'Critical' || c.isSafety).length,
    safety: allComplaints.filter(c => c.isSafety).length,
  }

  // Trending: group by subcategory, show those with 2+ complaints
  const trendingMap = {}
  allComplaints.forEach(c => {
    const key = `${c.category} › ${c.subcategory}`
    trendingMap[key] = (trendingMap[key] || 0) + 1
  })
  const trending = Object.entries(trendingMap).filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1])

  const filtered = allComplaints.filter(c => {
    const matchStatus = filter === 'All' || c.status === filter
    const matchSearch = !search || c.id.toLowerCase().includes(search.toLowerCase()) || c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const statuses = ['All', 'Submitted', 'Assigned', 'Under Review', 'Escalated', 'Resolved']

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">
              {currentUser?.isAdmin ? '🛡️ Admin Dashboard' : '📊 My Dashboard'}
            </h1>
            <p className="page-sub">
              {currentUser?.isAdmin
                ? `All complaints across the institution · ${currentUser.name}`
                : `Welcome back, ${currentUser?.name} · ${currentUser?.rollNo} · ${currentUser?.department}`}
            </p>
          </div>
          <div className="dashboard-actions">
            <Link to="/complaint/new" className="btn btn-primary">+ New Complaint</Link>
            <Link to="/feedback" className="btn btn-outline">+ Feedback</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label">Total Complaints</span>
          </div>
          <div className="stat-card stat-warning">
            <span className="stat-num">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card stat-success">
            <span className="stat-num">{stats.resolved}</span>
            <span className="stat-label">Resolved</span>
          </div>
          <div className="stat-card stat-danger">
            <span className="stat-num">{stats.critical}</span>
            <span className="stat-label">Critical / Safety</span>
          </div>
        </div>

        {/* Trending */}
        {trending.length > 0 && (
          <div className="trending-section">
            <h2 className="section-heading">🔥 Trending Issues</h2>
            <div className="trending-list">
              {trending.map(([key, count]) => (
                <div key={key} className="trending-item">
                  <span className="trending-key">{key}</span>
                  <span className="badge badge-danger">{count} complaints</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="filter-bar">
          <input type="text" placeholder="Search complaints…" value={search}
            onChange={e => setSearch(e.target.value)} className="form-input search-input" />
          <div className="filter-tabs">
            {statuses.map(s => (
              <button key={s} className={`filter-tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                {s}
                <span className="filter-count">{s === 'All' ? allComplaints.length : allComplaints.filter(c => c.status === s).length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Table */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">📭</p>
            <p className="empty-title">{allComplaints.length === 0 ? 'No complaints yet' : 'No complaints match your filter'}</p>
            {allComplaints.length === 0 && (
              <Link to="/complaint/new" className="btn btn-primary">File First Complaint</Link>
            )}
          </div>
        ) : (
          <div className="complaint-list">
            {filtered.map(c => (
              <div key={c.id} className="complaint-card">
                <div className="complaint-card-top">
                  <div className="complaint-card-meta">
                    <span className="complaint-card-id">{c.id}</span>
                    <span className={`badge ${STATUS_COLORS[c.status] || 'badge-neutral'}`}>{c.status}</span>
                    <span className={`badge ${PRIORITY_COLORS[c.priority] || 'badge-neutral'}`}>{c.priority}</span>
                    {c.isSafety && <span className="badge badge-danger">🚨 Safety</span>}
                    {c.isAnonymous && <span className="badge badge-info">🔒 Anon</span>}
                  </div>
                  <span className="complaint-card-date">{timeAgo(c.createdAt)}</span>
                </div>
                <h3 className="complaint-card-title">{c.title}</h3>
                <p className="complaint-card-cat">
                  {c.category} › {c.subcategory}
                  {currentUser?.isAdmin && !c.isAnonymous && <span className="complaint-user"> · {c.userName}</span>}
                </p>
                <div className="complaint-card-footer">
                  <span className="complaint-votes">👍 {c.votes}</span>
                  {c.assignedTo && <span className="complaint-assigned">📌 {c.assignedTo}</span>}
                  <div className="card-actions">
                    <button className="btn-link" onClick={() => navigate('/complaint/track')}>Track →</button>
                    {currentUser?.isAdmin && (
                      <button className="btn btn-sm btn-outline" onClick={() => setEditingComplaint(c)}>Update Status</button>
                    )}
                    {!currentUser?.isAdmin && c.status !== 'Resolved' && (
                      <button className="btn btn-sm btn-danger-outline" onClick={() => escalateComplaint(c.id)}>Escalate</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingComplaint && (
        <AdminStatusModal
          complaint={editingComplaint}
          onClose={() => setEditingComplaint(null)}
          onUpdate={updateStatus}
        />
      )}
    </div>
  )
}
