import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import {
  SquaresFour,
  EnvelopeSimple,
  Lock,
  WarningCircle,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { login } from '../services/authService'

// -------------------------------------------------
// Type definitions
// -------------------------------------------------

interface LoginFormState {
  email: string
  password: string
  rememberMe: boolean
}

// -------------------------------------------------
// Component
// -------------------------------------------------

export function Login() {
  const navigate = useNavigate()
  const { setAuthData } = useAuth()

  const [form, setForm] = useState<LoginFormState>({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // ---- Handlers ----

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const data = await login({ email: form.email, password: form.password })
      setAuthData(data.token, data.user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid credentials. Account locked after 5 failed attempts.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // ---- Render ----

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* ============================================
          LEFT PANE -- Branding (cupcake / light)
          ============================================ */}
      <div
        data-theme="cupcake"
        className="hidden lg:flex lg:w-[35%] flex-col justify-between bg-base-200 px-12 py-10"
      >
        <div>
          <SquaresFour
            size={48}
            weight="duotone"
            className="text-primary mb-4"
          />
          <h1 className="text-2xl font-semibold text-base-content">
            TransitOps
          </h1>
          <p className="text-sm text-base-content/60">
            Smart Transport Operations Platform
          </p>
        </div>

        <p className="text-xs font-medium uppercase tracking-wider text-base-content/40">
          TransitOps &copy; 2026 &middot; RBAC Enabled
        </p>
      </div>

      {/* ============================================
          RIGHT PANE -- Login Form (night / dark)
          ============================================ */}
      <div
        data-theme="night"
        className="flex flex-1 flex-col justify-center items-center bg-base-100 px-6 py-10 sm:px-12 lg:w-[65%] lg:px-16"
      >
        <div className="w-full max-w-md">
          {/* Mobile-only branding */}
          <div className="mb-8 lg:hidden">
            <SquaresFour
              size={36}
              weight="duotone"
              className="text-primary mb-3"
            />
            <h1 className="text-xl font-semibold text-base-content">
              TransitOps
            </h1>
            <p className="text-xs text-base-content/50">
              Smart Transport Operations Platform
            </p>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-semibold text-base-content mb-1">
            Sign in to your account
          </h2>
          <p className="text-sm text-base-content/50 mb-8">
            Enter your credentials to continue
          </p>

          {/* Error Box */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-error/30 bg-error/10 px-4 py-3">
              <WarningCircle
                size={20}
                weight="duotone"
                className="mt-0.5 shrink-0 text-error"
              />
              <div>
                <p className="text-xs font-semibold text-error">Error</p>
                <p className="text-xs text-error/80">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-base-content/50"
              >
                Email
              </label>
              <label className="input input-bordered w-full flex items-center gap-2">
                <EnvelopeSimple size={18} weight="duotone" className="text-base-content/40" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@transitops.in"
                  value={form.email}
                  onChange={handleChange}
                  className="grow bg-transparent text-sm"
                  autoComplete="email"
                />
              </label>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-base-content/50"
              >
                Password
              </label>
              <label className="input input-bordered w-full flex items-center gap-2">
                <Lock size={18} weight="duotone" className="text-base-content/40" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="grow bg-transparent text-sm"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlash size={16} weight="duotone" />
                  ) : (
                    <Eye size={16} weight="duotone" />
                  )}
                </button>
              </label>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="checkbox checkbox-primary checkbox-sm"
                />
                <span className="text-sm text-base-content/70">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-warning w-full text-sm font-semibold"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Navigation to Register */}
          <p className="mt-6 text-center text-sm text-base-content/50">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Register
            </Link>
          </p>

          {/* Dev-Only Bypass Button for UI Testing */}
          {import.meta.env.DEV && (
            <div className="mt-6 border-t border-base-content/10 pt-4">
              <button
                type="button"
                onClick={() => {
                  setAuthData('dev-mock-token', {
                    id: 'dev-user-001',
                    first_name: 'Raven',
                    last_name: 'K.',
                    email: 'raven@transitops.in',
                    role: 'Dispatcher',
                  })
                  navigate('/dashboard', { replace: true })
                }}
                className="btn btn-outline btn-info btn-sm w-full font-normal"
              >
                ⚡ Dev Bypass: Jump to Dashboard
              </button>
            </div>
          )}

          {/* Mobile-only footer */}
          <p className="mt-10 text-center text-xs font-medium uppercase tracking-wider text-base-content/30 lg:hidden">
            TransitOps &copy; 2026 &middot; RBAC Enabled
          </p>
        </div>
      </div>
    </div>
  )
}
