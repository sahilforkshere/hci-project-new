import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import NewComplaint from './pages/NewComplaint'
import TrackComplaint from './pages/TrackComplaint'
import Feedback from './pages/Feedback'
import Dashboard from './pages/Dashboard'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'

function Protected({ children }) {
  const { currentUser } = useApp()
  return currentUser ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/complaint/new" element={<Protected><NewComplaint /></Protected>} />
        <Route path="/complaint/track" element={<Protected><TrackComplaint /></Protected>} />
        <Route path="/feedback" element={<Protected><Feedback /></Protected>} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  )
}
