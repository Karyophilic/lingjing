import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './stores/auth'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Home from './pages/Home'
import Profile from './pages/Profile'
import InspirationDetail from './pages/InspirationDetail'
import Square from './pages/Square'
import Matches from './pages/Matches'
import Wakeup from './pages/Wakeup'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin text-4xl">💡</div></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/inspiration/:id" element={<ProtectedRoute><InspirationDetail /></ProtectedRoute>} />
        <Route path="/square" element={<ProtectedRoute><Square /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/wakeup" element={<ProtectedRoute><Wakeup /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
