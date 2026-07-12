import { apiFetch } from './api'
import type { VehicleAnalyticsRecord, MonthlyRevenueData } from '../types/api'

// -------------------------------------------------
// Service Methods
// -------------------------------------------------

/**
 * GET /reports/vehicle-analytics
 * Fetches vehicle analytics from the v_vehicle_analytics database view.
 */
export async function fetchVehicleAnalytics(): Promise<VehicleAnalyticsRecord[]> {
  return apiFetch<VehicleAnalyticsRecord[]>('/reports/vehicle-analytics')
}

/**
 * GET /reports/monthly-revenue
 * Fetches monthly revenue data for bar chart.
 */
export async function fetchMonthlyRevenue(): Promise<MonthlyRevenueData[]> {
  return apiFetch<MonthlyRevenueData[]>('/reports/monthly-revenue')
}
