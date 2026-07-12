import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Login } from './pages/Login'
import { Register } from './pages/Register'

// -------------------------------------------------
// Route Guards
// -------------------------------------------------

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

function PublicOnlyRoutes() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public-only routes (redirects to dashboard if already logged in) */}
          <Route element={<PublicOnlyRoutes />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected routes (redirects to login if not authenticated) */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <div className="flex items-center justify-center min-h-screen bg-base-100">
                  <p className="text-base-content text-sm">
                    Dashboard coming soon.
                  </p>
                </div>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
