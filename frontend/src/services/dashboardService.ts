import { apiFetch } from './api'
import type { DashboardKpis } from '../types/api'

export interface RecentTrip {
  id: string
  source: string
  destination: string
  status: 'draft' | 'dispatched' | 'completed' | 'cancelled'
  scheduled_at: string | null
  dispatched_at: string | null
  vehicles: { registration_number: string; name_model: string } | null
  drivers: { name: string } | null
}

/**
 * GET /dashboard/kpis
 * Returns aggregated KPI data for the dashboard.
 */
export async function fetchKpis(): Promise<DashboardKpis> {
  return apiFetch<DashboardKpis>('/dashboard/kpis')
}

/**
 * GET /trips?limit=5
 * Returns the 5 most recent trips for the dashboard table.
 * Requires Dispatcher or Financial Analyst role — returns [] otherwise.
 */
export async function fetchRecentTrips(): Promise<RecentTrip[]> {
  return apiFetch<RecentTrip[]>('/trips')
}
