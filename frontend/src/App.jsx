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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin text-4xl">💡</div></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  const location = useLocation()
  const isUniverse = location.pathname === '/universe'

  return (
    <div className={isUniverse ? '' : 'min-h-screen pb-20'} style={{ background: isUniverse ? '#0a0a1a' : '#f0f7ff' }}>
      {user && !isUniverse && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/inspiration/:id" element={<ProtectedRoute><InspirationDetail /></ProtectedRoute>} />
        <Route path="/square" element={<ProtectedRoute><Square /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
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
