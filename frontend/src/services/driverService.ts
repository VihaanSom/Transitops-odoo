import { apiFetch } from './api'
import type { Driver } from '../types/api'

/**
 * GET /drivers
 * Returns list of drivers, optionally filtered by status.
 */
export async function fetchDrivers(params?: { status?: string }): Promise<Driver[]> {
  const query = new URLSearchParams()
  if (params?.status && params.status !== 'All') {
    query.append('status', params.status.toLowerCase())
  }
  const queryString = query.toString()
  const endpoint = queryString ? `/drivers?${queryString}` : '/drivers'
  return apiFetch<Driver[]>(endpoint)
}
