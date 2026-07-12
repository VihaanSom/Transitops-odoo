import { apiFetch } from './api'
import type { Vehicle, CreateVehiclePayload } from '../types/api'

/**
 * GET /vehicles
 * Returns list of vehicles, optionally filtered by query parameters.
 */
export async function fetchVehicles(params?: {
  type?: string
  status?: string
}): Promise<Vehicle[]> {
  const query = new URLSearchParams()
  if (params?.type && params.type !== 'All') {
    query.append('type', params.type)
  }
  if (params?.status && params.status !== 'All') {
    query.append('status', params.status.toLowerCase().replace(' ', '_'))
  }
  const queryString = query.toString()
  const endpoint = queryString ? `/vehicles?${queryString}` : '/vehicles'
  return apiFetch<Vehicle[]>(endpoint)
}

/**
 * POST /vehicles
 * Creates a new vehicle in the registry.
 */
export async function createVehicle(payload: CreateVehiclePayload): Promise<Vehicle> {
  return apiFetch<Vehicle>('/vehicles', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
