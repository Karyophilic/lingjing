import { useState, useEffect, createContext, useContext } from 'react'
import { localAuth } from '../api/local'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = localAuth.getCurrentUser()
    if (u) setUser(u)
    setLoading(false)
  }, [])

  const login = (username, password) => {
    const res = localAuth.login(username, password)
    if (res.success) setUser(res.data.user)
    return res
  }

  const register = (username, password) => {
    const res = localAuth.register(username, password)
    if (res.success) setUser(res.data.user)
    return res
  }

  const logout = () => {
    localAuth.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
