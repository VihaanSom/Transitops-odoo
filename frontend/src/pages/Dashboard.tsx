import { useState, useEffect } from 'react'
import {
  Truck,
  CheckCircle,
  Wrench,
  Path,
  ClockCountdown,
  SteeringWheel,
  ChartDonut,
  Funnel,
  Circle,
} from '@phosphor-icons/react'
import { fetchKpis } from '../services/dashboardService'
import type { DashboardKpis } from '../types/api'

// -------------------------------------------------
// KPI Card config
// -------------------------------------------------

interface KpiCardConfig {
  key: keyof DashboardKpis
  label: string
  icon: React.ElementType
  accentColor: string
  format?: 'percent'
}

const KPI_CARDS: KpiCardConfig[] = [
  { key: 'activeVehicles', label: 'Active Vehicles', icon: Truck, accentColor: 'text-info' },
  { key: 'availableVehicles', label: 'Available Vehicles', icon: CheckCircle, accentColor: 'text-success' },
  { key: 'vehiclesInMaintenance', label: 'Vehicles in Maintenance', icon: Wrench, accentColor: 'text-warning' },
  { key: 'activeTrips', label: 'Active Trips', icon: Path, accentColor: 'text-info' },
  { key: 'pendingTrips', label: 'Pending Trips', icon: ClockCountdown, accentColor: 'text-warning' },
  { key: 'driversOnDuty', label: 'Drivers on Duty', icon: SteeringWheel, accentColor: 'text-primary' },
  { key: 'fleetUtilization', label: 'Fleet Utilization', icon: ChartDonut, accentColor: 'text-success', format: 'percent' },
]

// -------------------------------------------------
// Static mock data for Recent Trips & Vehicle Status
// (Replace with live API calls when endpoints are wired)
// -------------------------------------------------

interface RecentTrip {
  id: string
  vehicle: string
  driver: string
  status: 'on_trip' | 'completed' | 'dispatched' | 'draft'
  eta: string
}

const RECENT_TRIPS: RecentTrip[] = [
  { id: 'TR001', vehicle: 'VAN-05', driver: 'Alex', status: 'on_trip', eta: '45 min' },
  { id: 'TR002', vehicle: 'TRK-12', driver: 'John', status: 'completed', eta: '--' },
  { id: 'TR003', vehicle: 'MINI-09', driver: 'Priya', status: 'dispatched', eta: '1h 10m' },
  { id: 'TR006', vehicle: '--', driver: '--', status: 'draft', eta: 'Awaiting vehicle' },
]

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  on_trip: { label: 'On Trip', className: 'badge-info' },
  completed: { label: 'Completed', className: 'badge-success' },
  dispatched: { label: 'Dispatched', className: 'badge-primary' },
  draft: { label: 'Draft', className: 'badge-ghost' },
}

interface VehicleStatusBar {
  label: string
  value: number
  max: number
  color: string
}

const VEHICLE_STATUS_BARS: VehicleStatusBar[] = [
  { label: 'Available', value: 42, max: 100, color: 'progress-success' },
  { label: 'On Trip', value: 53, max: 100, color: 'progress-info' },
  { label: 'In Shop', value: 5, max: 100, color: 'progress-warning' },
  { label: 'Retired', value: 3, max: 100, color: 'progress-error' },
]

// -------------------------------------------------
// Component
// -------------------------------------------------

export function Dashboard() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchKpis()
      .then(setKpis)
      .catch(() => {
        // Silently fail -- KPI cards will show skeleton
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* ---- Page Header ---- */}
      <div>
        <h1 className="text-2xl font-semibold text-base-content">Dashboard</h1>
        <p className="text-sm text-base-content/50 mt-0.5">
          Overview of fleet operations and key metrics
        </p>
      </div>

      {/* ---- Filters ---- */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-base-content/50 shrink-0">
          <Funnel size={16} weight="duotone" />
          Filters
        </div>
        <select className="select select-bordered select-sm text-sm w-36 shrink-0 rounded-lg">
          <option>Vehicle Type: All</option>
          <option>Van</option>
          <option>Truck</option>
          <option>Mini</option>
        </select>
        <select className="select select-bordered select-sm text-sm w-36 shrink-0 rounded-lg">
          <option>Status: All</option>
          <option>Available</option>
          <option>On Trip</option>
          <option>In Shop</option>
        </select>
        <select className="select select-bordered select-sm text-sm w-36 shrink-0 rounded-lg">
          <option>Region: All</option>
          <option>North</option>
          <option>South</option>
          <option>East</option>
          <option>West</option>
        </select>
      </div>

      {/* ---- KPI Cards ---- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon
          const value = kpis ? kpis[card.key] : 0

          return (
            <div
              key={card.key}
              className="card bg-base-200 border border-base-300 shadow-sm"
            >
              <div className="card-body p-4 gap-2">
                {isLoading ? (
                  // Skeleton loading state
                  <>
                    <div className="skeleton h-3 w-20" />
                    <div className="skeleton h-8 w-14 mt-1" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-base-content/50 leading-tight">
                        {card.label}
                      </span>
                      <Icon size={18} weight="duotone" className={card.accentColor} />
                    </div>
                    <span className="text-2xl font-bold text-base-content tabular-nums">
                      {card.format === 'percent'
                        ? `${Math.round(value)}%`
                        : String(value).padStart(2, '0')}
                    </span>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ---- Bottom Section: Recent Trips + Vehicle Status ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Trips (3/5 width on desktop) */}
        <div className="lg:col-span-3 card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-base-content/70 mb-3">
              Recent Trips
            </h3>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-base-content/40">
                    <th className="font-medium">Trip</th>
                    <th className="font-medium">Vehicle</th>
                    <th className="font-medium">Driver</th>
                    <th className="font-medium">Status</th>
                    <th className="font-medium">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_TRIPS.map((trip) => {
                    const badge = STATUS_BADGE[trip.status]
                    return (
                      <tr key={trip.id} className="hover">
                        <td className="font-medium text-base-content">{trip.id}</td>
                        <td className="text-base-content/70">{trip.vehicle}</td>
                        <td className="text-base-content/70">{trip.driver}</td>
                        <td>
                          <span className={`badge badge-sm ${badge?.className}`}>
                            {badge?.label}
                          </span>
                        </td>
                        <td className="text-base-content/50">{trip.eta}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Vehicle Status (2/5 width on desktop) */}
        <div className="lg:col-span-2 card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-base-content/70 mb-4">
              Vehicle Status
            </h3>
            <div className="space-y-4">
              {VEHICLE_STATUS_BARS.map((bar) => (
                <div key={bar.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-base-content/70">
                      <Circle size={8} weight="fill" className={bar.color.replace('progress-', 'text-')} />
                      {bar.label}
                    </div>
                    <span className="font-medium text-base-content tabular-nums">{bar.value}</span>
                  </div>
                  <progress
                    className={`progress ${bar.color} w-full h-2`}
                    value={bar.value}
                    max={bar.max}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
