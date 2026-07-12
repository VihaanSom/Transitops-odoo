// -------------------------------------------------
// Auth API Types
// -------------------------------------------------

/** Allowed RBAC roles (matches database ENUMs) */
export type UserRole = 'Fleet Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst'

/** User object returned from auth endpoints */
export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

/** POST /auth/login request payload */
export interface LoginPayload {
  email: string
  password: string
}

/** POST /auth/login successful response */
export interface LoginResponse {
  token: string
  user: AuthUser
}

/** POST /auth/register request payload */
export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  role: UserRole
}

/** POST /auth/register successful response */
export interface RegisterResponse {
  user: AuthUser
}

// -------------------------------------------------
// Generic API Error
// -------------------------------------------------

export interface ApiErrorBody {
  message?: string
}
