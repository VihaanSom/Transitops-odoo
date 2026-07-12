// -------------------------------------------------
// Shared sub-shapes (returned via Prisma `include`)
// -------------------------------------------------

export interface FuelLogVehicle {
  id: number
  registration_number: string
  name_model: string
}

export interface FuelLogTrip {
  id: number
  source: string
  destination: string
  status?: string
}

export interface ExpenseVehicle {
  id: number
  registration_number: string
  name_model: string
}

export interface ExpenseTrip {
  id: number
  source: string
  destination: string
  status?: string
}

// -------------------------------------------------
// Fuel Logs
// -------------------------------------------------

/** GET /api/expenses/fuel — single fuel log row */
export interface FuelLog {
  id: number
  vehicle_id: number
  trip_id: number | null
  liters: string | number | null   // Prisma Decimal comes back as string over JSON
  cost: string | number | null
  log_date: string | null
  created_at: string | null
  vehicles: FuelLogVehicle
  trips: FuelLogTrip | null
}

/** POST /api/expenses/fuel request body */
export interface CreateFuelLogPayload {
  vehicle_id: number
  trip_id?: number | null
  liters: number
  cost: number
  log_date: string // ISO date string
}

// -------------------------------------------------
// General Expenses
// -------------------------------------------------

/** GET /api/expenses/general — single expense row */
export interface Expense {
  id: number
  vehicle_id: number
  trip_id: number | null
  expense_type: string
  amount: string | number | null   // Prisma Decimal
  created_at: string | null
  updated_at: string | null
  vehicles: ExpenseVehicle
  trips: ExpenseTrip | null
}

/** POST /api/expenses/general request body */
export interface CreateExpensePayload {
  vehicle_id: number
  trip_id?: number | null
  expense_type: string
  amount: number
}

// -------------------------------------------------
// Expense types enum (used in dropdowns)
// -------------------------------------------------

export const EXPENSE_TYPES = [
  'Maintenance',
  'Toll',
  'Driver Allowance',
  'Loading/Unloading',
  'Parking',
  'Insurance',
  'Registration',
  'Other',
] as const

export type ExpenseType = (typeof EXPENSE_TYPES)[number]
