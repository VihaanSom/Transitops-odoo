import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { AppShell } from './components/layout/AppShell'

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

          {/* Protected routes -- wrapped in AppShell */}
          <Route element={<ProtectedRoutes />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Placeholder routes for sidebar nav items */}
              <Route path="/fleet" element={<PlaceholderPage title="Fleet Management" />} />
              <Route path="/drivers" element={<PlaceholderPage title="Driver Management" />} />
              <Route path="/trips" element={<PlaceholderPage title="Trip Management" />} />
              <Route path="/maintenance" element={<PlaceholderPage title="Maintenance" />} />
              <Route path="/fuel-expenses" element={<PlaceholderPage title="Fuel & Expenses" />} />
              <Route path="/analytics" element={<PlaceholderPage title="Analytics" />} />
              <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

// -------------------------------------------------
// Placeholder for future pages
// -------------------------------------------------

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center py-32">
      <p className="text-sm text-base-content/40">
        {title} -- coming soon.
      </p>
    </div>
  )
}
