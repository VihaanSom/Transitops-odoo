import { apiFetch } from './api'
import type { DriverStatus } from '../types/models'
import type { Driver, CreateDriverPayload } from '../types/api'

// Helper: backend returns numeric IDs — normalise to string so the rest of
// the app (which uses string IDs throughout) keeps working without changes.
function normaliseDriver(d: Driver & { id: number | string }): Driver {
  return { ...d, id: String(d.id) }
}

/**
 * GET /drivers
 * Returns list of all drivers, optionally filtered by status.
 */
export async function fetchDrivers(params?: { status?: string }): Promise<Driver[]> {
  const query = new URLSearchParams()
  if (params?.status && params.status !== 'All') {
    query.append('status', params.status.toLowerCase())
  }
  const queryString = query.toString()
  const endpoint = queryString ? `/drivers?${queryString}` : '/drivers'
  const drivers = await apiFetch<Driver[]>(endpoint)
  return drivers.map(normaliseDriver)
}

/**
 * POST /drivers
 * Creates a new driver in the database.
 */
export async function createDriver(payload: CreateDriverPayload): Promise<Driver> {
  const driver = await apiFetch<Driver>('/drivers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return normaliseDriver(driver)
}

/**
 * PUT /drivers/:id/status
 * Updates a driver's status (Safety Officer only).
 */
export async function updateDriverStatus(id: string, status: DriverStatus): Promise<Driver> {
  const driver = await apiFetch<Driver>(`/drivers/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
  return normaliseDriver(driver)
}
