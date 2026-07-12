import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import {
  SquaresFour,
  EnvelopeSimple,
  Lock,
  CaretDown,
  WarningCircle,
  Eye,
  EyeSlash,
  User,
} from '@phosphor-icons/react'
import { register } from '../services/authService'
import type { UserRole } from '../types/api'

// -------------------------------------------------
// Type definitions
// -------------------------------------------------

interface RegisterFormState {
  firstName: string
  lastName: string
  email: string
  password: string
  role: UserRole
}

// -------------------------------------------------
// Constants
// -------------------------------------------------

const ROLES: readonly UserRole[] = [
  'Fleet Manager',
  'Dispatcher',
  'Safety Officer',
  'Financial Analyst',
]

// -------------------------------------------------
// Component
// -------------------------------------------------

export function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState<RegisterFormState>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Dispatcher',
  })

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // ---- Handlers ----

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
      })
      // Registration successful -- redirect to login
      navigate('/login', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.',
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
          RIGHT PANE -- Registration Form (night / dark)
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
            Create your account
          </h2>
          <p className="text-sm text-base-content/50 mb-8">
            Fill in your details to get started
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
            {/* First Name + Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="register-firstName"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-base-content/50"
                >
                  First Name
                </label>
                <label className="input input-bordered w-full flex items-center gap-2">
                  <User size={18} weight="duotone" className="text-base-content/40" />
                  <input
                    id="register-firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder="John"
                    value={form.firstName}
                    onChange={handleChange}
                    className="grow bg-transparent text-sm"
                    autoComplete="given-name"
                  />
                </label>
              </div>
              <div>
                <label
                  htmlFor="register-lastName"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-base-content/50"
                >
                  Last Name
                </label>
                <label className="input input-bordered w-full flex items-center gap-2">
                  <User size={18} weight="duotone" className="text-base-content/40" />
                  <input
                    id="register-lastName"
                    name="lastName"
                    type="text"
                    required
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={handleChange}
                    className="grow bg-transparent text-sm"
                    autoComplete="family-name"
                  />
                </label>
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-base-content/50"
              >
                Email
              </label>
              <label className="input input-bordered w-full flex items-center gap-2">
                <EnvelopeSimple size={18} weight="duotone" className="text-base-content/40" />
                <input
                  id="register-email"
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
                htmlFor="register-password"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-base-content/50"
              >
                Password
              </label>
              <label className="input input-bordered w-full flex items-center gap-2">
                <Lock size={18} weight="duotone" className="text-base-content/40" />
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  className="grow bg-transparent text-sm"
                  autoComplete="new-password"
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

            {/* Role Dropdown (sent to backend as part of register payload) */}
            <div>
              <label
                htmlFor="register-role"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-base-content/50"
              >
                Role (RBAC)
              </label>
              <div className="relative">
                <select
                  id="register-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="select select-bordered w-full text-sm appearance-none pr-10"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <CaretDown
                  size={16}
                  weight="bold"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40"
                />
              </div>
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
                'Register'
              )}
            </button>
          </form>

          {/* Navigation to Login */}
          <p className="mt-6 text-center text-sm text-base-content/50">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>

          {/* Mobile-only footer */}
          <p className="mt-10 text-center text-xs font-medium uppercase tracking-wider text-base-content/30 lg:hidden">
            TransitOps &copy; 2026 &middot; RBAC Enabled
          </p>
        </div>
      </div>
    </div>
  )
}
