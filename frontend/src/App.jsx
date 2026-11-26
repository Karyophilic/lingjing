import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './stores/auth'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Home from './pages/Home'
import Profile from './pages/Profile'
import InspirationDetail from './pages/InspirationDetail'
import Square from './pages/Square'
import Matches from './pages/Matches'
import Wakeup from './pages/Wakeup'
import AIChat from './pages/AIChat'
import Universe from './pages/Universe'
import Messages from './pages/Messages'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-9 h-9 rounded-full border-2 border-ink-300 border-t-ink-700 animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  const location = useLocation()
  const isUniverse = location.pathname === '/universe'

  return (
    <div className={isUniverse ? '' : 'min-h-screen pb-24'} style={{ background: isUniverse ? '#F7F2E6' : 'transparent' }}>
      {/* 手绘边框用的位移滤镜 */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <defs>
          <filter id="wobble-ink" x="-6%" y="-6%" width="112%" height="112%">
            <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" seed="9" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5.2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      {user && !isUniverse && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/inspiration/:id" element={<ProtectedRoute><InspirationDetail /></ProtectedRoute>} />
        <Route path="/square" element={<ProtectedRoute><Square /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/messages/:userId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
        <Route path="/wakeup" element={<ProtectedRoute><Wakeup /></ProtectedRoute>} />
        <Route path="/universe" element={<ProtectedRoute><Universe /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  )
}
