import type { DriverStatus } from './models'

// -------------------------------------------------
// Auth API Types
// -------------------------------------------------

/** Allowed RBAC roles (matches database ENUMs) */
export type UserRole = 'Fleet Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst'

/** User object returned from auth endpoints */
export interface AuthUser {
  id: string
  first_name: string | null
  last_name: string | null
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
  first_name?: string
  last_name?: string
  email: string
  password: string
  role: UserRole
}

/** POST /auth/register successful response */
export interface RegisterResponse {
  user: AuthUser
}

// -------------------------------------------------
// Dashboard API Types
// -------------------------------------------------

/** GET /dashboard/kpis response */
export interface DashboardKpis {
  activeVehicles: number
  availableVehicles: number
  vehiclesInMaintenance: number
  activeTrips: number
  pendingTrips: number
  driversOnDuty: number
  fleetUtilization: number
}

// -------------------------------------------------
// Generic API Error
// -------------------------------------------------

export interface ApiErrorBody {
  message?: string
}

// -------------------------------------------------
// Driver API Payload Types
// -------------------------------------------------

export interface CreateDriverPayload {
  name: string
  license_number: string
  license_category: string
  license_expiry_date: string
  contact_number: string
  safety_score: number
}

export interface UpdateDriverStatusPayload {
  status: DriverStatus
}
