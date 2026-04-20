import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const STATUS_COLORS_MAP = { Submitted: '#6366f1', Assigned: '#f59e0b', 'Under Review': '#ea580c', Resolved: '#16a34a', Escalated: '#dc2626' }
const PRIORITY_COLORS_MAP = { Low: '#16a34a', Medium: '#f59e0b', High: '#ea580c', Critical: '#dc2626' }

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso)
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`; if (h > 0) return `${h}h ago`; if (m > 0) return `${m}m ago`; return 'just now'
}

export default function Profile() {
  const { currentUser, myComplaints, feedbackList, logout } = useApp()
  const navigate = useNavigate()

  if (!currentUser) { navigate('/login'); return null }

  const resolved = myComplaints.filter(c => c.status === 'Resolved').length
  const pending = myComplaints.filter(c => c.status !== 'Resolved').length
  const resolutionRate = myComplaints.length ? Math.round((resolved / myComplaints.length) * 100) : 0
  const totalVotes = myComplaints.reduce((s, c) => s + (c.votes || 0), 0)
  const myFeedback = feedbackList.filter(f => f.userId === currentUser.id)

  const statusData = Object.entries(
    myComplaints.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name, value }))

  const categoryData = Object.entries(
    myComplaints.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc }, {})
  ).map(([name, count]) => ({ name, count }))

  const recentActivity = [
    ...myComplaints.map(c => ({ type: 'complaint', id: c.id, title: c.title, time: c.createdAt, status: c.status })),
    ...myFeedback.map(f => ({ type: 'feedback', id: f.id, title: `Feedback: ${f.targetName}`, time: f.createdAt, rating: f.rating })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="page">
      <div className="container">

        {/* Profile Header */}
        <div className="profile-hero">
          <div className="profile-avatar-lg">
            {currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="profile-hero-info">
            <h1 className="profile-name">{currentUser.name}</h1>
            <div className="profile-meta-row">
              <span className="profile-meta-chip">📧 {currentUser.email}</span>
              <span className="profile-meta-chip">🎓 {currentUser.rollNo}</span>
              <span className="profile-meta-chip">🏢 {currentUser.department}</span>
              {currentUser.year !== '-' && <span className="profile-meta-chip">📅 {currentUser.year} Year</span>}
              {currentUser.isAdmin && <span className="profile-meta-chip admin-chip">🛡️ Admin</span>}
            </div>
          </div>
          <button className="btn btn-outline btn-danger-outline" onClick={handleLogout}>Logout</button>
        </div>

        {/* Stats Row */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-num">{myComplaints.length}</div>
            <div className="profile-stat-label">Total Complaints</div>
          </div>
          <div className="profile-stat-card profile-stat-success">
            <div className="profile-stat-num">{resolved}</div>
            <div className="profile-stat-label">Resolved</div>
          </div>
          <div className="profile-stat-card profile-stat-warning">
            <div className="profile-stat-num">{pending}</div>
            <div className="profile-stat-label">Pending</div>
          </div>
          <div className="profile-stat-card profile-stat-accent">
            <div className="profile-stat-num">{resolutionRate}%</div>
            <div className="profile-stat-label">Resolution Rate</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-num">{totalVotes}</div>
            <div className="profile-stat-label">Total Votes Received</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-num">{myFeedback.length}</div>
            <div className="profile-stat-label">Feedback Submitted</div>
          </div>
        </div>

        <div className="profile-grid">
          {/* Charts */}
          <div className="profile-charts">
            {statusData.length > 0 && (
              <div className="card">
                <h3 className="card-title">Complaints by Status</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS_MAP[entry.name] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {categoryData.length > 0 && (
              <div className="card">
                <h3 className="card-title">Complaints by Category</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="card">
            <h3 className="card-title">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <p className="empty-text">No activity yet.</p>
            ) : (
              <ul className="activity-list">
                {recentActivity.map((a, i) => (
                  <li key={i} className="activity-item">
                    <div className={`activity-dot ${a.type === 'feedback' ? 'activity-dot-feedback' : 'activity-dot-complaint'}`} />
                    <div className="activity-body">
                      <p className="activity-title">{a.title}</p>
                      <div className="activity-meta">
                        <span className="activity-id">{a.id}</span>
                        {a.status && <span className={`badge badge-sm status-${a.status?.toLowerCase().replace(' ', '-')}`}>{a.status}</span>}
                        {a.rating && <span className="activity-rating">{'★'.repeat(a.rating)}{'☆'.repeat(5 - a.rating)}</span>}
                        <span className="activity-time">{timeAgo(a.time)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* My Complaints Quick View */}
        {myComplaints.length > 0 && (
          <div className="card mt-4">
            <div className="card-header-row">
              <h3 className="card-title">My Complaints</h3>
              <button className="btn-link" onClick={() => navigate('/complaint/track')}>View All →</button>
            </div>
            <div className="profile-complaint-list">
              {myComplaints.slice(0, 5).map(c => (
                <div key={c.id} className="profile-complaint-row">
                  <div className="profile-complaint-left">
                    <span className="complaint-card-id">{c.id}</span>
                    <span className="profile-complaint-title">{c.title}</span>
                  </div>
                  <div className="profile-complaint-right">
                    <span className={`badge ${c.priority === 'Critical' ? 'badge-danger' : c.priority === 'High' ? 'badge-orange' : 'badge-warning'}`}>{c.priority}</span>
                    <span className={`badge ${c.status === 'Resolved' ? 'badge-success' : c.status === 'Submitted' ? 'badge-info' : 'badge-warning'}`}>{c.status}</span>
                    <span className="activity-time">{timeAgo(c.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
