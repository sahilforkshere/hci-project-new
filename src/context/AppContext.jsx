import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

const STAGES = ['Submitted', 'Assigned', 'Under Review', 'Resolved']

const DEMO_USERS = [
  { id: 'admin-1', name: 'Admin', email: 'admin@iiitm.ac.in', password: 'admin123', rollNo: 'ADMIN', department: 'Administration', year: '-', isAdmin: true },
  { id: 'user-1', name: 'Sahil Pal', email: 'sahil@iiitm.ac.in', password: 'student123', rollNo: '2023IMT-069', department: 'CSE', year: '3rd', isAdmin: false },
  { id: 'user-2', name: 'Rohit Singh', email: 'rohit@iiitm.ac.in', password: 'student123', rollNo: '2023IMT-045', department: 'CSE', year: '3rd', isAdmin: false },
  { id: 'user-3', name: 'Aman Gupta', email: 'aman@iiitm.ac.in', password: 'student123', rollNo: '2023IMT-012', department: 'CSE', year: '3rd', isAdmin: false },
]

const now = new Date()
const daysAgo = (d) => new Date(now - d * 86400000).toISOString()

const DEMO_COMPLAINTS = [
  {
    id: 'CMP-001', userId: 'user-1', userName: 'Sahil Pal',
    category: 'Infrastructure', subcategory: 'Lab Equipment',
    title: 'Broken projector in CS Lab 3',
    description: 'The projector in CS Lab 3 has been non-functional for 2 weeks, severely affecting practical sessions.',
    priority: 'High', isSafety: false, isAnonymous: false,
    status: 'Under Review',
    statusHistory: [
      { stage: 'Submitted', time: daysAgo(10), note: 'Complaint received and logged.' },
      { stage: 'Assigned', time: daysAgo(9), note: 'Assigned to IT Department.' },
      { stage: 'Under Review', time: daysAgo(7), note: 'IT team is assessing the equipment.' },
    ],
    assignedTo: 'IT Department', createdAt: daysAgo(10), updatedAt: daysAgo(7), votes: 8,
  },
  {
    id: 'CMP-002', userId: 'user-2', userName: 'Rohit Singh',
    category: 'Hostel & Mess', subcategory: 'Mess Food Quality',
    title: 'Poor food quality in mess this week',
    description: 'Food served in the main mess is consistently undercooked and cold. Affects all hostel students.',
    priority: 'Medium', isSafety: false, isAnonymous: false,
    status: 'Resolved',
    statusHistory: [
      { stage: 'Submitted', time: daysAgo(20), note: 'Complaint received.' },
      { stage: 'Assigned', time: daysAgo(19), note: 'Assigned to Mess Committee.' },
      { stage: 'Under Review', time: daysAgo(18), note: 'Mess Committee reviewing.' },
      { stage: 'Resolved', time: daysAgo(15), note: 'Menu revised and new chef appointed.' },
    ],
    assignedTo: 'Mess Committee', createdAt: daysAgo(20), updatedAt: daysAgo(15), votes: 15,
  },
  {
    id: 'CMP-003', userId: 'user-3', userName: 'Anonymous',
    category: 'Infrastructure', subcategory: 'Safety Apparatus',
    title: 'Faulty fire extinguisher in Block B corridor',
    description: 'The fire extinguisher in Block B, 2nd floor corridor has a broken pressure gauge and may be non-functional.',
    priority: 'Critical', isSafety: true, isAnonymous: true,
    status: 'Assigned',
    statusHistory: [
      { stage: 'Submitted', time: daysAgo(2), note: 'Safety complaint received — expedited handling.' },
      { stage: 'Assigned', time: daysAgo(1), note: 'Assigned to Estate Office for urgent inspection.' },
    ],
    assignedTo: 'Estate Office', createdAt: daysAgo(2), updatedAt: daysAgo(1), votes: 3,
  },
  {
    id: 'CMP-004', userId: 'user-1', userName: 'Sahil Pal',
    category: 'Academic', subcategory: 'Assessment Fairness',
    title: 'Mid-semester marks not updated on portal',
    description: 'Mid-semester exam marks for Data Structures have not been uploaded to the academic portal despite 3 weeks passing.',
    priority: 'Medium', isSafety: false, isAnonymous: false,
    status: 'Submitted',
    statusHistory: [
      { stage: 'Submitted', time: daysAgo(1), note: 'Complaint received and logged.' },
    ],
    assignedTo: null, createdAt: daysAgo(1), updatedAt: daysAgo(1), votes: 6,
  },
]

const DEMO_FEEDBACK = [
  {
    id: 'FB-001', userId: 'user-1',
    targetType: 'Faculty', targetName: 'Prof. Sharma — Data Structures',
    rating: 4, aspects: ['Good explanations', 'Approachable'],
    comment: 'Great teaching style, but needs more practice problems before exams.',
    isAnonymous: true, createdAt: daysAgo(5),
  },
]

const DEMO_NOTIFICATIONS = [
  { id: 'N-001', userId: 'user-1', message: 'Your complaint CMP-001 has been assigned to IT Department.', type: 'update', read: false, createdAt: daysAgo(9) },
  { id: 'N-002', userId: 'user-2', message: 'Your complaint CMP-002 has been resolved. Menu revised and new chef appointed.', type: 'resolved', read: false, createdAt: daysAgo(15) },
  { id: 'N-003', userId: 'user-3', message: 'Safety complaint CMP-003 has been assigned to Estate Office for urgent inspection.', type: 'update', read: true, createdAt: daysAgo(1) },
]

function load(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null } catch { return null }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)) }

function initStore(key, demo) {
  const existing = load(key)
  if (existing) return existing
  save(key, demo)
  return demo
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => load('hci_user'))
  const [complaints, setComplaints] = useState(() => initStore('hci_complaints', DEMO_COMPLAINTS))
  const [feedbackList, setFeedbackList] = useState(() => initStore('hci_feedback', DEMO_FEEDBACK))
  const [notifications, setNotifications] = useState(() => initStore('hci_notifications', DEMO_NOTIFICATIONS))

  const persistComplaints = (data) => { setComplaints(data); save('hci_complaints', data) }
  const persistFeedback = (data) => { setFeedbackList(data); save('hci_feedback', data) }
  const persistNotifications = (data) => { setNotifications(data); save('hci_notifications', data) }

  const addNotification = (userId, message, type, notifs) => {
    const n = { id: `N-${Date.now()}`, userId, message, type, read: false, createdAt: new Date().toISOString() }
    const updated = [...notifs, n]
    persistNotifications(updated)
    return updated
  }

  const login = (email, password) => {
    const user = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (!user) return { success: false, error: 'Invalid email or password.' }
    setCurrentUser(user)
    save('hci_user', user)
    return { success: true, user }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('hci_user')
  }

  const submitComplaint = (data) => {
    const id = `CMP-${String(complaints.length + 1).padStart(3, '0')}`
    const ts = new Date().toISOString()
    const complaint = {
      id, userId: currentUser.id,
      userName: data.isAnonymous ? 'Anonymous' : currentUser.name,
      ...data, status: 'Submitted',
      statusHistory: [{ stage: 'Submitted', time: ts, note: data.isSafety ? 'Safety complaint received — expedited handling.' : 'Complaint received and logged.' }],
      assignedTo: null, createdAt: ts, updatedAt: ts, votes: 0,
    }
    const updated = [...complaints, complaint]
    persistComplaints(updated)
    addNotification(currentUser.id, `Complaint ${id} submitted successfully.`, 'success', notifications)
    return { success: true, id }
  }

  const submitFeedback = (data) => {
    const fb = { id: `FB-${String(feedbackList.length + 1).padStart(3, '0')}`, userId: currentUser.id, ...data, createdAt: new Date().toISOString() }
    persistFeedback([...feedbackList, fb])
    return { success: true }
  }

  const updateStatus = (complaintId, newStatus, note, assignedTo) => {
    const ts = new Date().toISOString()
    const updated = complaints.map(c => {
      if (c.id !== complaintId) return c
      return { ...c, status: newStatus, statusHistory: [...c.statusHistory, { stage: newStatus, time: ts, note }], assignedTo: assignedTo || c.assignedTo, updatedAt: ts }
    })
    persistComplaints(updated)
    const c = complaints.find(x => x.id === complaintId)
    if (c) addNotification(c.userId, `Complaint ${complaintId} updated to "${newStatus}". ${note}`, newStatus === 'Resolved' ? 'resolved' : 'update', notifications)
  }

  const escalateComplaint = (complaintId) => {
    const ts = new Date().toISOString()
    const updated = complaints.map(c => {
      if (c.id !== complaintId) return c
      return { ...c, priority: 'Critical', statusHistory: [...c.statusHistory, { stage: 'Escalated', time: ts, note: 'Escalated to higher authority by student.' }], updatedAt: ts }
    })
    persistComplaints(updated)
    addNotification(currentUser.id, `Complaint ${complaintId} has been escalated.`, 'update', notifications)
  }

  const voteComplaint = (complaintId) => {
    persistComplaints(complaints.map(c => c.id === complaintId ? { ...c, votes: c.votes + 1 } : c))
  }

  const markRead = (notifId) => {
    persistNotifications(notifications.map(n => n.id === notifId ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    persistNotifications(notifications.map(n => n.userId === currentUser?.id ? { ...n, read: true } : n))
  }

  const myComplaints = currentUser ? (currentUser.isAdmin ? complaints : complaints.filter(c => c.userId === currentUser.id)) : []
  const myNotifications = currentUser ? notifications.filter(n => n.userId === currentUser.id) : []
  const unreadCount = currentUser ? notifications.filter(n => n.userId === currentUser.id && !n.read).length : 0

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      complaints, myComplaints, submitComplaint, updateStatus, escalateComplaint, voteComplaint,
      feedbackList, submitFeedback,
      notifications, myNotifications, unreadCount, markRead, markAllRead,
      STAGES,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
