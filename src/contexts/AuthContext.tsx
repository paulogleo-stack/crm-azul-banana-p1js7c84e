import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { UserRecord } from '@/types/crm'
import {
  getCurrentUser,
  isAuthenticated,
  onAuthChange,
  refreshSession,
  signIn as authenticate,
  signOut as clearSession,
} from '@/services/auth'

interface AuthContextValue {
  user: UserRecord | null
  loading: boolean
  login: (email: string, password: string) => Promise<UserRecord>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRecord | null>(() =>
    isAuthenticated() ? getCurrentUser() : null,
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(() => setUser(getCurrentUser()))
    void refreshSession().then((record) => {
      setUser(record)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const record = await authenticate(email, password)
        setUser(record)
        return record
      },
      logout: () => {
        clearSession()
        setUser(null)
      },
    }),
    [loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
