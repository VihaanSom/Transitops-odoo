import { apiFetch } from './api'
import type {
  FuelLog,
  CreateFuelLogPayload,
  Expense,
  CreateExpensePayload,
} from '../types/expenses'

// -------------------------------------------------
// Fuel Logs
// -------------------------------------------------

/**
 * GET /api/expenses/fuel
 * Returns all fuel logs, most recent first.
 * Optional filters: vehicle_id, trip_id
 */
export async function fetchFuelLogs(params?: {
  vehicle_id?: number
  trip_id?: number
}): Promise<FuelLog[]> {
  const query = new URLSearchParams()
  if (params?.vehicle_id) query.append('vehicle_id', String(params.vehicle_id))
  if (params?.trip_id) query.append('trip_id', String(params.trip_id))
  const qs = query.toString()
  return apiFetch<FuelLog[]>(qs ? `/expenses/fuel?${qs}` : '/expenses/fuel')
}

/**
 * POST /api/expenses/fuel
 * Records a fuel fill-up.
 */
export async function createFuelLog(
  payload: CreateFuelLogPayload,
): Promise<FuelLog> {
  return apiFetch<FuelLog>('/expenses/fuel', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// -------------------------------------------------
// General Expenses
// -------------------------------------------------

/**
 * GET /api/expenses/general
 * Returns all general expenses, most recent first.
 * Optional filters: vehicle_id, trip_id, expense_type
 */
export async function fetchExpenses(params?: {
  vehicle_id?: number
  trip_id?: number
  expense_type?: string
}): Promise<Expense[]> {
  const query = new URLSearchParams()
  if (params?.vehicle_id) query.append('vehicle_id', String(params.vehicle_id))
  if (params?.trip_id) query.append('trip_id', String(params.trip_id))
  if (params?.expense_type) query.append('expense_type', params.expense_type)
  const qs = query.toString()
  return apiFetch<Expense[]>(qs ? `/expenses/general?${qs}` : '/expenses/general')
}

/**
 * POST /api/expenses/general
 * Records a miscellaneous expense.
 */
export async function createExpense(
  payload: CreateExpensePayload,
): Promise<Expense> {
  return apiFetch<Expense>('/expenses/general', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
