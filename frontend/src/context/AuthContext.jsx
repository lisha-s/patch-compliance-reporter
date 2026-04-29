/* eslint-disable */
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem('token')
  )

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('token')
    if (!stored) return null
    try {
      const payload = JSON.parse(atob(stored.split('.')[1]))
      return { username: payload.sub, role: payload.role }
    } catch {
      return null
    }
  })

  const login = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]))
      setUser({ username: payload.sub, role: payload.role })
    } catch {
      setUser(null)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: Boolean(token), login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}