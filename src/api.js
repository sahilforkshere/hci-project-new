const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function getToken() {
  return localStorage.getItem('hci_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

function normalizeComplaint(c) {
  return { ...c, id: c.complaintId, _id: c._id }
}

function normalizeNotification(n) {
  return { ...n, id: n._id }
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  getComplaints: async () => (await request('/complaints')).map(normalizeComplaint),
  submitComplaint: async (data) => normalizeComplaint(await request('/complaints', { method: 'POST', body: JSON.stringify(data) })),
  updateStatus: async (id, newStatus, note, assignedTo) => normalizeComplaint(await request(`/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify({ newStatus, note, assignedTo }) })),
  escalateComplaint: async (id) => normalizeComplaint(await request(`/complaints/${id}/escalate`, { method: 'PATCH' })),
  voteComplaint: async (id) => normalizeComplaint(await request(`/complaints/${id}/vote`, { method: 'PATCH' })),

  getFeedback: () => request('/feedback'),
  submitFeedback: (data) => request('/feedback', { method: 'POST', body: JSON.stringify(data) }),

  getNotifications: async () => (await request('/notifications')).map(normalizeNotification),
  markRead: async (id) => normalizeNotification(await request(`/notifications/${id}/read`, { method: 'PATCH' })),
  markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
}
