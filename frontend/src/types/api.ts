import type { DriverStatus } from './models'

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
// Vehicle API Types
// -------------------------------------------------

export type VehicleStatus = 'available' | 'on_trip' | 'in_shop' | 'retired'

export interface Vehicle {
  id: string
  registration_number: string
  name_model: string
  vehicle_type: string
  max_load_capacity: number
  odometer: number
  acquisition_cost: number
  status: VehicleStatus
}

export interface CreateVehiclePayload {
  registration_number: string
  name_model: string
  vehicle_type: string
  max_load_capacity: number
  odometer: number
  acquisition_cost: number
}

// -------------------------------------------------
// Driver API Types
// -------------------------------------------------

export type DriverStatus = 'available' | 'on_trip' | 'off_duty' | 'suspended'

export interface Driver {
  id: string
  name: string
  license_number: string
  license_category: string
  license_expiry_date: string
  contact_number: string
  safety_score: number
  status: DriverStatus
}

// -------------------------------------------------
// Trip API Types
// -------------------------------------------------

export type TripStatus = 'draft' | 'dispatched' | 'completed' | 'cancelled'

export interface Trip {
  id: string
  source: string
  destination: string
  vehicle_id: string
  driver_id: string
  cargo_weight: number
  planned_distance: number
  start_odometer?: number
  scheduled_at?: string
  dispatched_at?: string
  completed_at?: string
  cancelled_at?: string
  status: TripStatus
  // Optional populated relationships/display info
  vehicle?: Vehicle | { id: string; registration_number: string; name_model: string; max_load_capacity: number }
  driver?: Driver | { id: string; name: string }
  eta?: string
}

export interface CreateTripPayload {
  source: string
  destination: string
  vehicle_id: string
  driver_id: string
  cargo_weight: number
  planned_distance: number
  start_odometer?: number
  scheduled_at?: string
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

// -------------------------------------------------
// Maintenance API Types
// -------------------------------------------------

export type MaintenanceStatus = 'open' | 'closed' | 'in_shop' | 'completed' | string

export interface MaintenanceRecord {
  id: string
  vehicle_id: string
  description: string
  cost?: number
  status: MaintenanceStatus
  created_at?: string
  closed_at?: string
  vehicle?: Vehicle | { id: string; registration_number: string; name_model: string; vehicle_type?: string }
}

export interface CreateMaintenancePayload {
  vehicle_id: string
  description: string
  cost?: number
}

export interface CloseMaintenancePayload {
  cost?: number
  closed_at?: string
}

