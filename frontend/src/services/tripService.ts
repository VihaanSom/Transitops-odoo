import { apiFetch } from './api'
import type { Trip, CreateTripPayload } from '../types/api'

// Helper: normalise numeric backend IDs to string
function normaliseTrip(t: Trip & { id: number | string }): Trip {
  return { ...t, id: String(t.id) }
}

/**
 * GET /trips
 * Returns list of all trips (optionally filtered by ?status=).
 */
export async function fetchTrips(params?: { status?: string }): Promise<Trip[]> {
  const query = new URLSearchParams()
  if (params?.status) query.append('status', params.status)
  const qs = query.toString()
  const trips = await apiFetch<Trip[]>(qs ? `/trips?${qs}` : '/trips')
  return trips.map(normaliseTrip)
}

/**
 * POST /trips
 * Creates a new trip in draft status.
 */
export async function createTrip(payload: CreateTripPayload): Promise<Trip> {
  const trip = await apiFetch<Trip>('/trips', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return normaliseTrip(trip)
}

/**
 * PATCH /trips/:id/dispatch
 * Transitions trip draft → dispatched.
 * DB triggers: validates vehicle/driver availability, sets both to on_trip.
 */
export async function dispatchTrip(id: string, dispatched_at?: string): Promise<Trip> {
  const trip = await apiFetch<Trip>(`/trips/${id}/dispatch`, {
    method: 'PATCH',
    body: JSON.stringify({ dispatched_at: dispatched_at || new Date().toISOString() }),
  })
  return normaliseTrip(trip)
}

/**
 * PATCH /trips/:id/complete
 * Marks a dispatched trip as completed.
 * DB trigger automatically restores vehicle + driver → available.
 */
export async function completeTrip(
  id: string,
  data: { final_odometer?: number; revenue?: number; completed_at?: string },
): Promise<Trip> {
  const trip = await apiFetch<Trip>(`/trips/${id}/complete`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return normaliseTrip(trip)
}

/**
 * PATCH /trips/:id/cancel
 * Cancels a draft or dispatched trip.
 * DB trigger automatically restores vehicle + driver → available.
 */
export async function cancelTrip(id: string, cancelled_at?: string): Promise<Trip> {
  const trip = await apiFetch<Trip>(`/trips/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ cancelled_at: cancelled_at || new Date().toISOString() }),
  })
  return normaliseTrip(trip)
}
