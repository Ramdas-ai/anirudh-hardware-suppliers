import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

// Real auth for Phase 3, built against authService's localStorage-backed
// implementation. Swapping to real JWT-based auth in Phase 5 only means
// changing authService.js — this context and every component using
// useAuth() stays the same.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const register = useCallback(async (data) => {
    const u = await authService.register(data)
    setUser(u)
    return u
  }, [])

  const login = useCallback(async (data) => {
    const u = await authService.login(data)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const addAddress = useCallback(
    async (address) => {
      if (!user) throw new Error('Not logged in.')
      const u = await authService.addAddress(user.id, address)
      setUser(u)
      return u
    },
    [user]
  )

  const removeAddress = useCallback(
    async (addressId) => {
      if (!user) throw new Error('Not logged in.')
      const u = await authService.removeAddress(user.id, addressId)
      setUser(u)
      return u
    },
    [user]
  )

  const value = { user, loading, register, login, logout, addAddress, removeAddress, isAdmin: user?.role === 'admin' }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
