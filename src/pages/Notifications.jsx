import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const TYPE_ICONS = { success: '✅', update: '🔄', resolved: '🎉', error: '⚠️' }
const TYPE_COLORS = { success: 'notif-success', update: 'notif-update', resolved: 'notif-resolved', error: 'notif-error' }

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Notifications() {
  const { myNotifications, markRead, markAllRead, unreadCount } = useApp()
  const navigate = useNavigate()

  const sorted = [...myNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="page">
      <div className="container container-sm">
        <div className="page-header notif-page-header">
          <div>
            <h1 className="page-title">🔔 Notifications</h1>
            <p className="page-sub">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark all read</button>
          )}
        </div>

        {sorted.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">🔔</p>
            <p className="empty-title">No notifications yet</p>
            <p className="empty-sub">You&apos;ll be notified here whenever your complaint status changes.</p>
            <button className="btn btn-primary" onClick={() => navigate('/complaint/new')}>File a Complaint</button>
          </div>
        ) : (
          <div className="notif-list">
            {sorted.map(n => (
              <div
                key={n.id}
                className={`notif-item ${!n.read ? 'unread' : ''} ${TYPE_COLORS[n.type] || ''}`}
                onClick={() => markRead(n.id)}
              >
                <div className="notif-icon-col">
                  <span className="notif-type-icon">{TYPE_ICONS[n.type] || '🔔'}</span>
                  {!n.read && <span className="unread-dot" />}
                </div>
                <div className="notif-body">
                  <p className="notif-message">{n.message}</p>
                  <span className="notif-time">{formatDate(n.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="notif-info-box">
          <p>📱 In the full implementation, these would arrive as push notifications on your mobile device — no email required.</p>
        </div>
      </div>
    </div>
  )
}
