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
 * GET /dashboard/recent-trips
 * Returns the 5 most recent trips for the dashboard widget.
 * Accessible to all authenticated roles — uses a dedicated dashboard endpoint
 * that bypasses the /trips RBAC restriction.
 */
export async function fetchRecentTrips(): Promise<RecentTrip[]> {
  return apiFetch<RecentTrip[]>('/dashboard/recent-trips')
}
