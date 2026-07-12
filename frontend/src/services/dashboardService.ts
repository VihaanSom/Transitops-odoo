import { apiFetch } from './api'
import type { DashboardKpis } from '../types/api'

/**
 * GET /dashboard/kpis
 * Returns aggregated KPI data for the dashboard.
 */
export async function fetchKpis(): Promise<DashboardKpis> {
  return apiFetch<DashboardKpis>('/dashboard/kpis')
}
