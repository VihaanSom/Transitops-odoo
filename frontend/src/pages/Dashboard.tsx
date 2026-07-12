import { useState, useEffect } from 'react'
import {
  TruckIcon as Truck,
  CheckCircleIcon as CheckCircle,
  WrenchIcon as Wrench,
  PathIcon as Path,
  ClockCountdownIcon as ClockCountdown,
  SteeringWheelIcon as SteeringWheel,
  ChartDonutIcon as ChartDonut,
  FunnelIcon as Funnel,
  CircleIcon as Circle,
  ArrowRightIcon as ArrowRight,
} from '@phosphor-icons/react'
import { fetchKpis, fetchRecentTrips } from '../services/dashboardService'
import type { DashboardKpis } from '../types/api'
import type { RecentTrip } from '../services/dashboardService'

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
  { key: 'vehiclesInMaintenance', label: 'In Maintenance', icon: Wrench, accentColor: 'text-warning' },
  { key: 'activeTrips', label: 'Active Trips', icon: Path, accentColor: 'text-info' },
  { key: 'pendingTrips', label: 'Pending Trips', icon: ClockCountdown, accentColor: 'text-warning' },
  { key: 'driversOnDuty', label: 'Drivers on Duty', icon: SteeringWheel, accentColor: 'text-primary' },
  { key: 'fleetUtilization', label: 'Fleet Utilization', icon: ChartDonut, accentColor: 'text-success', format: 'percent' },
]

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  on_trip: { label: 'On Trip', className: 'badge-info' },
  completed: { label: 'Completed', className: 'badge-success' },
  dispatched: { label: 'Dispatched', className: 'badge-primary' },
  draft: { label: 'Draft', className: 'badge-ghost' },
  cancelled: { label: 'Cancelled', className: 'badge-error' },
}

// -------------------------------------------------
// Component
// -------------------------------------------------

export function Dashboard() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null)
  const [trips, setTrips] = useState<RecentTrip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tripsLoading, setTripsLoading] = useState(true)

  useEffect(() => {
    // Load KPIs (all authenticated roles can access this)
    fetchKpis()
      .then(setKpis)
      .catch(() => {
        // KPI cards will show skeleton / zeros
      })
      .finally(() => setIsLoading(false))

    // Load recent trips (Dispatcher / Financial Analyst only — graceful fail for other roles)
    fetchRecentTrips()
      .then((data) => setTrips(data.slice(0, 5)))
      .catch(() => {
        // Role doesn't have access — leave trips empty, table shows "no access" message
        setTrips([])
      })
      .finally(() => setTripsLoading(false))
  }, [])

  // Derive vehicle status bars from live KPI data
  const totalKnown = kpis
    ? kpis.availableVehicles + kpis.activeVehicles + kpis.vehiclesInMaintenance
    : 0

  const vehicleStatusBars = kpis
    ? [
        { label: 'Available', value: kpis.availableVehicles, max: Math.max(totalKnown, 1), color: 'text-success', progressColor: 'progress-success' },
        { label: 'On Trip', value: kpis.activeVehicles, max: Math.max(totalKnown, 1), color: 'text-info', progressColor: 'progress-info' },
        { label: 'In Shop', value: kpis.vehiclesInMaintenance, max: Math.max(totalKnown, 1), color: 'text-warning', progressColor: 'progress-warning' },
      ]
    : []

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
                    <th className="font-medium">Route</th>
                    <th className="font-medium">Vehicle</th>
                    <th className="font-medium">Driver</th>
                    <th className="font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tripsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td><div className="skeleton h-4 w-36" /></td>
                        <td><div className="skeleton h-4 w-24" /></td>
                        <td><div className="skeleton h-4 w-20" /></td>
                        <td><div className="skeleton h-5 w-20 rounded-full" /></td>
                      </tr>
                    ))
                  ) : trips.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-base-content/40 text-sm">
                        No trips to show. (Requires Dispatcher or Financial Analyst role.)
                      </td>
                    </tr>
                  ) : (
                    trips.map((trip) => {
                      const badge = STATUS_BADGE[trip.status] ?? { label: trip.status, className: 'badge-ghost' }
                      return (
                        <tr key={trip.id} className="hover">
                          <td>
                            <div className="flex items-center gap-1 text-sm font-medium text-base-content">
                              <span>{trip.source}</span>
                              <ArrowRight size={12} weight="bold" className="text-base-content/30" />
                              <span>{trip.destination}</span>
                            </div>
                          </td>
                          <td className="text-base-content/70 text-xs font-mono">
                            {trip.vehicles?.registration_number ?? '—'}
                          </td>
                          <td className="text-base-content/70">
                            {trip.drivers?.name ?? '—'}
                          </td>
                          <td>
                            <span className={`badge badge-sm ${badge.className}`}>
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
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
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="skeleton h-3 w-24" />
                    <div className="skeleton h-2 w-full rounded-full" />
                  </div>
                ))
              ) : (
                vehicleStatusBars.map((bar) => (
                  <div key={bar.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className={`flex items-center gap-2 text-base-content/70`}>
                        <Circle size={8} weight="fill" className={bar.color} />
                        {bar.label}
                      </div>
                      <span className="font-medium text-base-content tabular-nums">{bar.value}</span>
                    </div>
                    <progress
                      className={`progress ${bar.progressColor} w-full h-2`}
                      value={bar.value}
                      max={bar.max}
                    />
                  </div>
                ))
              )}

              {/* Fleet utilization summary */}
              {!isLoading && kpis && (
                <div className="pt-2 mt-2 border-t border-base-300">
                  <div className="flex items-center justify-between text-xs text-base-content/50">
                    <span>Fleet Utilization</span>
                    <span className="font-semibold text-success tabular-nums">{kpis.fleetUtilization}%</span>
                  </div>
                  <progress
                    className="progress progress-success w-full h-2 mt-1"
                    value={kpis.fleetUtilization}
                    max={100}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
