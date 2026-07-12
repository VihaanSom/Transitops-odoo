import { apiFetch } from './api'
import type { Trip, CreateTripPayload } from '../types/api'

/**
 * GET /trips
 * Returns list of trips.
 */
export async function fetchTrips(): Promise<Trip[]> {
  return apiFetch<Trip[]>('/trips')
}

/**
 * POST /trips
 * Creates a new trip in draft status.
 */
export async function createTrip(payload: CreateTripPayload): Promise<Trip> {
  return apiFetch<Trip>('/trips', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      vehicle_id: Number(payload.vehicle_id),
      driver_id: Number(payload.driver_id),
    }),
  })
}

/**
 * PATCH /trips/:id/dispatch
 * Updates trip status to dispatched.
 */
export async function dispatchTrip(id: string, dispatched_at?: string): Promise<Trip> {
  return apiFetch<Trip>(`/trips/${id}/dispatch`, {
    method: 'PATCH',
    body: JSON.stringify({ dispatched_at: dispatched_at || new Date().toISOString() }),
  })
}
