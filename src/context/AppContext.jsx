import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../api'

const AppContext = createContext()

const STAGES = ['Submitted', 'Assigned', 'Under Review', 'Resolved']

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hci_user')) } catch { return null }
  })
  const [complaints, setComplaints] = useState([])
  const [feedbackList, setFeedbackList] = useState([])
  const [notifications, setNotifications] = useState([])

  const fetchData = useCallback(async () => {
    if (!currentUser) return
    try {
      const [c, f, n] = await Promise.all([api.getComplaints(), api.getFeedback(), api.getNotifications()])
      setComplaints(c)
      setFeedbackList(f)
      setNotifications(n)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    }
  }, [currentUser])

  useEffect(() => { fetchData() }, [fetchData])

  const login = async (email, password) => {
    try {
      const { token, user } = await api.login(email, password)
      localStorage.setItem('hci_token', token)
      localStorage.setItem('hci_user', JSON.stringify(user))
      setCurrentUser(user)
      return { success: true, user }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const register = async (data) => {
    try {
      const { token, user } = await api.register(data)
      localStorage.setItem('hci_token', token)
      localStorage.setItem('hci_user', JSON.stringify(user))
      setCurrentUser(user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const logout = () => {
    setCurrentUser(null)
    setComplaints([])
    setFeedbackList([])
    setNotifications([])
    localStorage.removeItem('hci_token')
    localStorage.removeItem('hci_user')
  }

  const submitComplaint = async (data) => {
    try {
      const complaint = await api.submitComplaint({ ...data, userName: currentUser.name })
      setComplaints(prev => [complaint, ...prev])
      const notifs = await api.getNotifications()
      setNotifications(notifs)
      return { success: true, id: complaint.complaintId }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const submitFeedback = async (data) => {
    try {
      const fb = await api.submitFeedback(data)
      setFeedbackList(prev => [fb, ...prev])
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const updateStatus = async (complaintId, newStatus, note, assignedTo) => {
    try {
      const updated = await api.updateStatus(complaintId, newStatus, note, assignedTo)
      setComplaints(prev => prev.map(c => c.complaintId === complaintId ? updated : c))
      const notifs = await api.getNotifications()
      setNotifications(notifs)
    } catch (err) {
      console.error('updateStatus failed:', err)
    }
  }

  const escalateComplaint = async (complaintId) => {
    try {
      const updated = await api.escalateComplaint(complaintId)
      setComplaints(prev => prev.map(c => c.complaintId === complaintId ? updated : c))
      const notifs = await api.getNotifications()
      setNotifications(notifs)
    } catch (err) {
      console.error('escalate failed:', err)
    }
  }

  const voteComplaint = async (complaintId) => {
    try {
      const updated = await api.voteComplaint(complaintId)
      setComplaints(prev => prev.map(c => c.complaintId === complaintId ? updated : c))
    } catch (err) {
      console.error('vote failed:', err)
    }
  }

  const markRead = async (notifId) => {
    try {
      const updated = await api.markRead(notifId)
      setNotifications(prev => prev.map(n => n._id === notifId ? updated : n))
    } catch (err) {
      console.error('markRead failed:', err)
    }
  }

  const markAllRead = async () => {
    try {
      await api.markAllRead()
      setNotifications(prev => prev.map(n => n.userId === currentUser?.id ? { ...n, read: true } : n))
    } catch (err) {
      console.error('markAllRead failed:', err)
    }
  }

  const myComplaints = currentUser
    ? (currentUser.isAdmin ? complaints : complaints.filter(c => c.userId === currentUser._id || c.userId === currentUser.id))
    : []
  const myNotifications = notifications
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <AppContext.Provider value={{
      currentUser, login, register, logout,
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
