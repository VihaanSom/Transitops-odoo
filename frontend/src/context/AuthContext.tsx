import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { AuthUser } from '../types/api'

// -------------------------------------------------
// Context value shape
// -------------------------------------------------

interface AuthContextValue {
  isAuthenticated: boolean
  user: AuthUser | null
  token: string | null
  setAuthData: (token: string, user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// -------------------------------------------------
// Helpers
// -------------------------------------------------

function getStoredAuth(): { token: string; user: AuthUser } | null {
  const token = localStorage.getItem('transitops-token')
  const userRaw = localStorage.getItem('transitops-user')
  if (token && userRaw) {
    try {
      return { token, user: JSON.parse(userRaw) as AuthUser }
    } catch {
      return null
    }
  }
  return null
}

// -------------------------------------------------
// Provider
// -------------------------------------------------

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [auth, setAuth] = useState(getStoredAuth)

  const setAuthData = useCallback((token: string, user: AuthUser) => {
    localStorage.setItem('transitops-token', token)
    localStorage.setItem('transitops-user', JSON.stringify(user))
    setAuth({ token, user })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('transitops-token')
    localStorage.removeItem('transitops-user')
    setAuth(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!auth,
        user: auth?.user ?? null,
        token: auth?.token ?? null,
        setAuthData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// -------------------------------------------------
// Hook
// -------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
