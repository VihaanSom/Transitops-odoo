import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/feedback/Toast'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Drivers } from './pages/Drivers'
import { Vehicles } from './pages/Vehicles'
import { FuelExpenses } from './pages/FuelExpenses'
import { Trips } from './pages/Trips'
import { Maintenance } from './pages/Maintenance'
import { Analytics } from './pages/Analytics'
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
      <ToastProvider>
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
              <Route path="/fleet" element={<Vehicles />} />
              <Route path="/vehicles" element={<Navigate to="/fleet" replace />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/fuel-expenses" element={<FuelExpenses />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

// -------------------------------------------------
// Placeholder for future pages
// -------------------------------------------------

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center py-32">
      <p className="text-sm text-base-content/40 font-medium">
        {title} &mdash; coming soon.
      </p>
    </div>
  )
}
