import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const STATUS_COLORS = { Submitted: 'badge-info', Assigned: 'badge-warning', 'Under Review': 'badge-orange', Escalated: 'badge-danger', Resolved: 'badge-success' }
const PRIORITY_COLORS = { Low: 'badge-success', Medium: 'badge-warning', High: 'badge-orange', Critical: 'badge-danger' }
const STATUS_ORDER = ['Submitted', 'Assigned', 'Under Review', 'Resolved']
const PIE_COLORS = { Submitted: '#6366f1', Assigned: '#f59e0b', 'Under Review': '#ea580c', Resolved: '#16a34a', Escalated: '#dc2626' }

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso)
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`; if (h > 0) return `${h}h ago`; if (m > 0) return `${m}m ago`; return 'just now'
}

function StatusProgress({ status }) {
  const steps = ['Submitted', 'Assigned', 'Under Review', 'Resolved']
  const idx = steps.indexOf(status)
  return (
    <div className="status-progress">
      {steps.map((s, i) => (
        <div key={s} className={`sp-step ${i <= idx ? 'sp-done' : ''} ${i === idx ? 'sp-active' : ''}`}>
          <div className="sp-dot" />
          {i < steps.length - 1 && <div className="sp-line" />}
        </div>
      ))}
    </div>
  )
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

function ComplaintDetailModal({ complaint, onClose, onEscalate, isAdmin, onUpdate }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{complaint.title}</h3>
            <span className="complaint-card-id">{complaint.id}</span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="detail-badges">
            <span className={`badge ${STATUS_COLORS[complaint.status] || 'badge-neutral'}`}>{complaint.status}</span>
            <span className={`badge ${PRIORITY_COLORS[complaint.priority] || 'badge-neutral'}`}>{complaint.priority}</span>
            {complaint.isSafety && <span className="badge badge-danger">🚨 Safety</span>}
            {complaint.isAnonymous && <span className="badge badge-info">🔒 Anonymous</span>}
          </div>
          <p className="detail-desc">{complaint.description}</p>
          <div className="detail-meta-grid">
            <div><label>Category</label><span>{complaint.category} › {complaint.subcategory}</span></div>
            <div><label>Assigned To</label><span>{complaint.assignedTo || '—'}</span></div>
            <div><label>Filed</label><span>{new Date(complaint.createdAt).toLocaleDateString()}</span></div>
            <div><label>Votes</label><span>👍 {complaint.votes}</span></div>
          </div>
          <h4 className="timeline-heading">Status Timeline</h4>
          <div className="timeline">
            {complaint.statusHistory.map((h, i) => (
              <div key={i} className={`timeline-item ${i === complaint.statusHistory.length - 1 ? 'timeline-latest' : ''}`}>
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-stage">{h.stage}</div>
                  <div className="timeline-note">{h.note}</div>
                  <div className="timeline-time">{new Date(h.time).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          {isAdmin && <button className="btn btn-primary" onClick={() => { onUpdate(complaint); onClose() }}>Update Status</button>}
          {!isAdmin && complaint.status !== 'Resolved' && (
            <button className="btn btn-danger-outline" onClick={() => { onEscalate(complaint.id); onClose() }}>🚨 Escalate</button>
          )}
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { currentUser, myComplaints, complaints, updateStatus, escalateComplaint } = useApp()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [editingComplaint, setEditingComplaint] = useState(null)
  const [viewingComplaint, setViewingComplaint] = useState(null)
  const [activeTab, setActiveTab] = useState('complaints')

  const allComplaints = currentUser?.isAdmin ? complaints : myComplaints

  const stats = {
    total: allComplaints.length,
    pending: allComplaints.filter(c => c.status !== 'Resolved').length,
    resolved: allComplaints.filter(c => c.status === 'Resolved').length,
    critical: allComplaints.filter(c => c.priority === 'Critical' || c.isSafety).length,
  }

  const trendingMap = {}
  allComplaints.forEach(c => {
    const key = c.category
    trendingMap[key] = (trendingMap[key] || 0) + 1
  })

  const statusChartData = STATUS_ORDER.map(s => ({
    name: s, count: allComplaints.filter(c => c.status === s).length
  })).filter(d => d.count > 0)

  const categoryChartData = Object.entries(
    allComplaints.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc }, {})
  ).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)

  const pieData = statusChartData.map(d => ({ name: d.name, value: d.count }))

  const categories = ['All', ...new Set(allComplaints.map(c => c.category))]

  let filtered = allComplaints.filter(c => {
    const matchStatus = statusFilter === 'All' || c.status === statusFilter
    const matchPriority = priorityFilter === 'All' || c.priority === priorityFilter
    const matchCategory = categoryFilter === 'All' || c.category === categoryFilter
    const matchSearch = !search || c.id.toLowerCase().includes(search.toLowerCase()) || c.title.toLowerCase().includes(search.toLowerCase()) || c.userName?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchPriority && matchCategory && matchSearch
  })

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortBy === 'votes') return b.votes - a.votes
    if (sortBy === 'priority') {
      const p = { Critical: 4, High: 3, Medium: 2, Low: 1 }
      return (p[b.priority] || 0) - (p[a.priority] || 0)
    }
    return 0
  })

  const handleEscalate = (id) => {
    escalateComplaint(id)
    toast('Complaint escalated to higher authority.', 'warning')
  }

  const handleUpdate = (id, status, note, assignedTo) => {
    updateStatus(id, status, note, assignedTo)
    toast(`Status updated to "${status}".`, 'success')
  }

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
                ? `Managing all complaints · ${currentUser.name}`
                : `Welcome back, ${currentUser?.name} · ${currentUser?.rollNo}`}
            </p>
          </div>
          <div className="dashboard-actions">
            <Link to="/complaint/new" className="btn btn-primary">+ New Complaint</Link>
            <Link to="/feedback" className="btn btn-outline">+ Feedback</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card" onClick={() => setStatusFilter('All')} style={{ cursor: 'pointer' }}>
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label">Total</span>
            <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '100%', background: '#6366f1' }} /></div>
          </div>
          <div className="stat-card stat-warning" onClick={() => setStatusFilter('Submitted')} style={{ cursor: 'pointer' }}>
            <span className="stat-num">{stats.pending}</span>
            <span className="stat-label">Pending</span>
            <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${stats.total ? (stats.pending / stats.total) * 100 : 0}%`, background: '#f59e0b' }} /></div>
          </div>
          <div className="stat-card stat-success" onClick={() => setStatusFilter('Resolved')} style={{ cursor: 'pointer' }}>
            <span className="stat-num">{stats.resolved}</span>
            <span className="stat-label">Resolved</span>
            <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${stats.total ? (stats.resolved / stats.total) * 100 : 0}%`, background: '#16a34a' }} /></div>
          </div>
          <div className="stat-card stat-danger">
            <span className="stat-num">{stats.critical}</span>
            <span className="stat-label">Critical / Safety</span>
            <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${stats.total ? (stats.critical / stats.total) * 100 : 0}%`, background: '#dc2626' }} /></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          <button className={`dash-tab ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}>📋 Complaints</button>
          <button className={`dash-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>📊 Analytics</button>
        </div>

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <div className="analytics-grid">
              <div className="card">
                <h3 className="card-title">Complaints by Status</h3>
                {pieData.length === 0 ? <p className="empty-text">No data yet.</p> : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} (${value})`}>
                        {pieData.map((entry, i) => <Cell key={i} fill={PIE_COLORS[entry.name] || '#6b7280'} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="card">
                <h3 className="card-title">Complaints by Category</h3>
                {categoryChartData.length === 0 ? <p className="empty-text">No data yet.</p> : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={categoryChartData} margin={{ top: 8, right: 8, left: -16, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="card mt-4">
              <h3 className="card-title">Resolution Rate</h3>
              <div className="resolution-rate-bar">
                <div className="rrb-label">
                  <span>Resolved</span>
                  <span>{stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%</span>
                </div>
                <div className="rrb-track">
                  <div className="rrb-fill" style={{ width: `${stats.total ? (stats.resolved / stats.total) * 100 : 0}%` }} />
                </div>
                <div className="rrb-label">
                  <span>Pending</span>
                  <span>{stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}%</span>
                </div>
                <div className="rrb-track">
                  <div className="rrb-fill rrb-pending" style={{ width: `${stats.total ? (stats.pending / stats.total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'complaints' && (
          <>
            {/* Filter Bar */}
            <div className="advanced-filter-bar">
              <input type="text" placeholder="🔍 Search by ID, title, name…" value={search}
                onChange={e => setSearch(e.target.value)} className="form-input search-input" />
              <div className="filter-row">
                <select className="form-input filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  {['Submitted', 'Assigned', 'Under Review', 'Escalated', 'Resolved'].map(s => <option key={s}>{s}</option>)}
                </select>
                <select className="form-input filter-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                  <option value="All">All Priorities</option>
                  {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
                </select>
                <select className="form-input filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
                <select className="form-input filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="votes">Most Votes</option>
                  <option value="priority">Highest Priority</option>
                </select>
                {(search || statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All') && (
                  <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setStatusFilter('All'); setPriorityFilter('All'); setCategoryFilter('All') }}>
                    ✕ Clear
                  </button>
                )}
              </div>
              <p className="filter-result-count">Showing {filtered.length} of {allComplaints.length} complaints</p>
            </div>

            {/* Complaints List */}
            {filtered.length === 0 ? (
              <div className="empty-state">
                <p className="empty-icon">📭</p>
                <p className="empty-title">{allComplaints.length === 0 ? 'No complaints yet' : 'No complaints match your filters'}</p>
                {allComplaints.length === 0 && <Link to="/complaint/new" className="btn btn-primary">File First Complaint</Link>}
                {allComplaints.length > 0 && <button className="btn btn-outline" onClick={() => { setSearch(''); setStatusFilter('All'); setPriorityFilter('All'); setCategoryFilter('All') }}>Clear Filters</button>}
              </div>
            ) : (
              <div className="complaint-list">
                {filtered.map(c => (
                  <div key={c.id} className="complaint-card complaint-card-hover" onClick={() => setViewingComplaint(c)}>
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
                    <StatusProgress status={c.status} />
                    <div className="complaint-card-footer" onClick={e => e.stopPropagation()}>
                      <span className="complaint-votes">👍 {c.votes}</span>
                      {c.assignedTo && <span className="complaint-assigned">📌 {c.assignedTo}</span>}
                      <div className="card-actions">
                        {currentUser?.isAdmin && (
                          <button className="btn btn-sm btn-outline" onClick={e => { e.stopPropagation(); setEditingComplaint(c) }}>Update Status</button>
                        )}
                        {!currentUser?.isAdmin && c.status !== 'Resolved' && (
                          <button className="btn btn-sm btn-danger-outline" onClick={e => { e.stopPropagation(); handleEscalate(c.id) }}>Escalate</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {editingComplaint && (
        <AdminStatusModal complaint={editingComplaint} onClose={() => setEditingComplaint(null)} onUpdate={handleUpdate} />
      )}
      {viewingComplaint && (
        <ComplaintDetailModal
          complaint={viewingComplaint}
          onClose={() => setViewingComplaint(null)}
          onEscalate={handleEscalate}
          isAdmin={currentUser?.isAdmin}
          onUpdate={(c) => setEditingComplaint(c)}
        />
      )}
    </div>
  )
}
