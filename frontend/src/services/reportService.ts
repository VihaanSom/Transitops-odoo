import { apiFetch } from './api'
import type { VehicleAnalyticsRecord, MonthlyRevenueData } from '../types/api'

// -------------------------------------------------
// Mock Data & Fallbacks for Local / Offline Mode
// -------------------------------------------------

const MOCK_VEHICLE_ANALYTICS: VehicleAnalyticsRecord[] = [
  {
    vehicle_id: '2',
    registration_number: 'GJ01AB9981',
    name_model: 'TRUCK-11',
    total_revenue: 350000,
    total_maintenance_cost: 18000,
    total_fuel_cost: 42000,
    total_distance: 14200,
    total_fuel_liters: 1690, // ~8.4 km/l avg contribution
    acquisition_cost: 2450000,
    vehicle_roi: 11.83,
  },
  {
    vehicle_id: '3',
    registration_number: 'GJ01AB1120',
    name_model: 'MINI-03',
    total_revenue: 120000,
    total_maintenance_cost: 6200,
    total_fuel_cost: 18500,
    total_distance: 8400,
    total_fuel_liters: 1000,
    acquisition_cost: 410000,
    vehicle_roi: 23.24,
  },
  {
    vehicle_id: '1',
    registration_number: 'GJ01AB4521',
    name_model: 'VAN-05',
    total_revenue: 145000,
    total_maintenance_cost: 2500,
    total_fuel_cost: 7200,
    total_distance: 12100,
    total_fuel_liters: 1440,
    acquisition_cost: 620000,
    vehicle_roi: 21.82,
  },
]

const MOCK_MONTHLY_REVENUE: MonthlyRevenueData[] = [
  { month: 'Jan', revenue: 68000 },
  { month: 'Feb', revenue: 84000 },
  { month: 'Mar', revenue: 81000 },
  { month: 'Apr', revenue: 105000 },
  { month: 'May', revenue: 98000 },
  { month: 'Jun', revenue: 118000 },
  { month: 'Jul', revenue: 112000 },
]

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// -------------------------------------------------
// Service Methods
// -------------------------------------------------

/**
 * GET /reports/vehicle-analytics
 * Fetches vehicle analytics from the v_vehicle_analytics database view.
 */
export async function fetchVehicleAnalytics(): Promise<VehicleAnalyticsRecord[]> {
  try {
    return await apiFetch<VehicleAnalyticsRecord[]>('/reports/vehicle-analytics')
  } catch (error) {
    console.warn('Backend unavailable or failed for GET /reports/vehicle-analytics. Using mock fallback.', error)
    await delay(350)
    return [...MOCK_VEHICLE_ANALYTICS]
  }
}

/**
 * GET /reports/monthly-revenue
 * Fetches monthly revenue data for bar chart.
 */
export async function fetchMonthlyRevenue(): Promise<MonthlyRevenueData[]> {
  try {
    return await apiFetch<MonthlyRevenueData[]>('/reports/monthly-revenue')
  } catch (error) {
    console.warn('Backend unavailable or failed for GET /reports/monthly-revenue. Using mock fallback.', error)
    await delay(300)
    return [...MOCK_MONTHLY_REVENUE]
  }
}
