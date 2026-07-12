// -------------------------------------------------
// Auth API Types
// -------------------------------------------------

/** POST /auth/login request payload */
export interface LoginPayload {
  email: string
  password: string
}

/** User object returned from the auth endpoints */
export interface AuthUser {
  id: string
  email: string
  role: 'Fleet Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst'
}

/** POST /auth/login successful response */
export interface LoginResponse {
  token: string
  user: AuthUser
}

// -------------------------------------------------
// Generic API Error
// -------------------------------------------------

export interface ApiErrorBody {
  message?: string
}
