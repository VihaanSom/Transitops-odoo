import { useState, useEffect, type FormEvent, type ChangeEvent, useMemo } from 'react'
import {
  Path,
  Truck,
  User,
  WarningCircle,
  CheckCircle,
  PaperPlaneRight,
  ArrowsClockwise,
  MapPin,
  ArrowRight,
  XCircle,
  Clock,
  X,
} from '@phosphor-icons/react'
import { fetchVehicles } from '../services/vehicleService'
import { fetchDrivers } from '../services/driverService'
import { fetchTrips, createTrip, dispatchTrip, completeTrip, cancelTrip } from '../services/tripService'
import type { Vehicle, Driver, Trip, CreateTripPayload, TripStatus } from '../types/api'

const STATUS_BADGE_CONFIG: Record<TripStatus, { label: string; badgeClass: string }> = {
  draft: { label: 'Draft', badgeClass: 'badge-ghost border-base-300 text-base-content/70' },
  dispatched: { label: 'Dispatched', badgeClass: 'badge-info font-semibold shadow-2xs' },
  completed: { label: 'Completed', badgeClass: 'badge-success font-semibold shadow-2xs' },
  cancelled: { label: 'Cancelled', badgeClass: 'badge-error font-semibold shadow-2xs' },
}

// -------------------------------------------------
// Component
// -------------------------------------------------

export function Trips() {
  // Lists State
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([])
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Interactive Live Board & Dynamic Stepper State
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)

  // Form State
  const [formState, setFormState] = useState<CreateTripPayload>({
    source: '',
    destination: '',
    vehicle_id: '',
    driver_id: '',
    cargo_weight: 0,
    planned_distance: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // Saved Depots State from localStorage
  const [availableDepots, setAvailableDepots] = useState<string[]>([
    'Gandhinagar Depot',
    'Ahmedabad Hub',
    'Sanand Warehouse',
  ])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('depots')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAvailableDepots(parsed)
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved depots from localStorage, using default array.', err)
    }
  }, [])

  // ---- Fetch Data ----
  async function loadAllData() {
    setIsLoading(true)
    setError(null)
    try {
      const [vData, dData, tData] = await Promise.all([
        fetchVehicles({ status: 'available' }),
        fetchDrivers({ status: 'available' }),
        fetchTrips(),
      ])

      setAvailableVehicles(vData)
      setAvailableDrivers(dData)
      setTrips(tData)

      // Set default selected vehicle & driver if form is empty
      if (vData.length > 0 || dData.length > 0) {
        setFormState((prev) => ({
          ...prev,
          vehicle_id: prev.vehicle_id || (vData[0]?.id ?? ''),
          driver_id: prev.driver_id || (dData[0]?.id ?? ''),
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trip data from server.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Selected Trip Derived State ----
  const selectedTrip = useMemo(() => {
    if (!selectedTripId) return null
    return trips.find((t) => t.id === selectedTripId) || null
  }, [trips, selectedTripId])

  // Current status for dynamic stepper (if no card selected, defaults to 'draft')
  const activeStepperStatus: TripStatus = selectedTrip ? selectedTrip.status : 'draft'

  // ---- Selected Vehicle & Capacity Check ----
  const selectedVehicle = useMemo(() => {
    return availableVehicles.find((v) => v.id === formState.vehicle_id)
  }, [availableVehicles, formState.vehicle_id])

  const capacityExceededBy = useMemo(() => {
    if (!selectedVehicle) return 0
    const diff = formState.cargo_weight - selectedVehicle.max_load_capacity
    return diff > 0 ? diff : 0
  }, [selectedVehicle, formState.cargo_weight])

  const isCapacityExceeded = capacityExceededBy > 0

  // ---- Handlers ----
  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
    setFormSuccess(null)
  }

  async function handleCreateTrip(e: FormEvent) {
    e.preventDefault()
    if (isCapacityExceeded) return

    setIsSubmitting(true)
    setError(null)
    setFormSuccess(null)

    try {
      const newTrip = await createTrip(formState)
      setFormSuccess(`Trip ${newTrip.id || 'created'} successfully!`)
      await loadAllData()
      if (newTrip.id) {
        setSelectedTripId(newTrip.id)
      }
      setFormState((prev) => ({
        ...prev,
        source: '',
        destination: '',
        cargo_weight: 0,
        planned_distance: 0,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleQuickDispatch(tripId: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation()
    try {
      await dispatchTrip(tripId)
      await loadAllData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dispatch trip.')
    }
  }

  async function handleCompleteTrip(tripId: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation()
    try {
      await completeTrip(tripId, {})
      await loadAllData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete trip.')
    }
  }

  async function handleCancelTrip(tripId: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation()
    try {
      await cancelTrip(tripId)
      await loadAllData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel trip.')
    }
  }

  function handleResetForm() {
    setFormState((prev) => ({
      ...prev,
      source: '',
      destination: '',
      cargo_weight: 0,
      planned_distance: 0,
    }))
    setFormSuccess(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* ---- Page Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-300 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-base-content flex items-center gap-2.5">
            <Path size={26} weight="duotone" className="text-info" />
            Trip Dispatcher
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Create routes, assign available vehicles and drivers, and monitor the live dispatch board
          </p>
        </div>

        <button
          type="button"
          onClick={loadAllData}
          disabled={isLoading}
          className="btn btn-ghost btn-sm text-base-content/60 self-start sm:self-auto flex items-center gap-1.5"
          title="Refresh Data"
        >
          <ArrowsClockwise size={18} weight="duotone" className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ---- Two-Column Responsive Grid ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Dynamic Trip Lifecycle Stepper & Form      */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dynamic Trip Lifecycle Card */}
          <div className="card bg-base-200/60 border border-base-300 p-5 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-2">
                Trip Lifecycle
              </h2>

              {selectedTrip ? (
                <div className="flex items-center gap-2">
                  <span className="badge badge-sm badge-info font-mono font-semibold">
                    Viewing: {selectedTrip.id} ({selectedTrip.status.toUpperCase()})
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTripId(null)}
                    className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-base-content"
                    title="Clear Selection (View Create Trip State)"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </div>
              ) : (
                <span className="badge badge-sm badge-ghost text-xs text-base-content/60 font-medium">
                  State: Create Trip (Draft)
                </span>
              )}
            </div>

            {/* Dynamic DaisyUI Stepper */}
            <ul className="steps w-full text-xs font-medium">
              {/* Draft Step: Always highlighted when in draft, dispatched, completed, or cancelled */}
              <li
                className={`step ${
                  activeStepperStatus === 'draft' ||
                  activeStepperStatus === 'dispatched' ||
                  activeStepperStatus === 'completed' ||
                  activeStepperStatus === 'cancelled'
                    ? 'step-success text-success font-semibold'
                    : 'text-base-content/40'
                }`}
              >
                Draft
              </li>

              {/* Dispatched Step */}
              <li
                className={`step ${
                  activeStepperStatus === 'dispatched' || activeStepperStatus === 'completed'
                    ? 'step-info text-info font-semibold'
                    : 'text-base-content/40'
                }`}
              >
                Dispatched
              </li>

              {/* Completed Step */}
              <li
                className={`step ${
                  activeStepperStatus === 'completed'
                    ? 'step-success text-success font-semibold'
                    : 'text-base-content/40'
                }`}
              >
                Completed
              </li>

              {/* Cancelled Step */}
              <li
                className={`step ${
                  activeStepperStatus === 'cancelled'
                    ? 'step-error text-error font-semibold'
                    : 'text-base-content/40'
                }`}
              >
                Cancelled
              </li>
            </ul>
          </div>

          {/* Create Trip Form Card */}
          <div className="card bg-base-200 border border-base-300 p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-base-300/60 pb-3.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-base-content flex items-center gap-2">
                Create Trip
              </h2>
              {selectedVehicle && (
                <span className="text-xs font-mono text-base-content/60 bg-base-300 px-2.5 py-1 rounded-md">
                  Cap: {selectedVehicle.max_load_capacity.toLocaleString()} kg
                </span>
              )}
            </div>

            {/* Success/Error messages */}
            {formSuccess && (
              <div className="flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/10 px-3.5 py-2.5 text-xs text-success font-medium">
                <CheckCircle size={18} weight="duotone" className="shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-error/30 bg-error/10 px-3.5 py-2.5 text-xs text-error font-medium">
                <WarningCircle size={18} weight="duotone" className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateTrip} className="space-y-4">
              {/* Source */}
              <div>
                <label
                  htmlFor="source"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                >
                  Source <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    id="source"
                    name="source"
                    required
                    value={formState.source}
                    onChange={handleInputChange}
                    className="select select-bordered w-full text-sm rounded-lg pl-9"
                  >
                    <option value="" disabled>
                      Select Source Depot
                    </option>
                    {availableDepots.map((depot) => (
                      <option key={`src-${depot}`} value={depot}>
                        {depot}
                      </option>
                    ))}
                  </select>
                  <MapPin size={16} weight="duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                </div>
              </div>

              {/* Destination */}
              <div>
                <label
                  htmlFor="destination"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                >
                  Destination <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    id="destination"
                    name="destination"
                    required
                    value={formState.destination}
                    onChange={handleInputChange}
                    className="select select-bordered w-full text-sm rounded-lg pl-9"
                  >
                    <option value="" disabled>
                      Select Destination Depot
                    </option>
                    {availableDepots.map((depot) => (
                      <option key={`dst-${depot}`} value={depot}>
                        {depot}
                      </option>
                    ))}
                  </select>
                  <ArrowRight size={16} weight="duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                </div>
              </div>

              {/* Vehicle (Available Only) */}
              <div>
                <label
                  htmlFor="vehicle_id"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                >
                  Vehicle (Available Only) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    id="vehicle_id"
                    name="vehicle_id"
                    required
                    value={formState.vehicle_id}
                    onChange={handleInputChange}
                    className="select select-bordered w-full text-sm rounded-lg pl-9"
                  >
                    {availableVehicles.length === 0 ? (
                      <option value="">No available vehicles</option>
                    ) : (
                      availableVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name_model} - {v.max_load_capacity.toLocaleString()} kg capacity
                        </option>
                      ))
                    )}
                  </select>
                  <Truck size={16} weight="duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                </div>
              </div>

              {/* Driver (Available Only) */}
              <div>
                <label
                  htmlFor="driver_id"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                >
                  Driver (Available Only) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    id="driver_id"
                    name="driver_id"
                    required
                    value={formState.driver_id}
                    onChange={handleInputChange}
                    className="select select-bordered w-full text-sm rounded-lg pl-9"
                  >
                    {availableDrivers.length === 0 ? (
                      <option value="">No available drivers</option>
                    ) : (
                      availableDrivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))
                    )}
                  </select>
                  <User size={16} weight="duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                </div>
              </div>

              {/* Cargo Weight & Distance Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cargo Weight (KG) */}
                <div>
                  <label
                    htmlFor="cargo_weight"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                  >
                    Cargo Weight (KG) <span className="text-error">*</span>
                  </label>
                  <input
                    id="cargo_weight"
                    name="cargo_weight"
                    type="number"
                    required
                    min={0}
                    step={10}
                    value={formState.cargo_weight || ''}
                    onChange={handleInputChange}
                    placeholder="700"
                    className="input input-bordered w-full text-sm tabular-nums rounded-lg"
                  />
                </div>

                {/* Planned Distance (KM) */}
                <div>
                  <label
                    htmlFor="planned_distance"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                  >
                    Planned Distance (KM) <span className="text-error">*</span>
                  </label>
                  <input
                    id="planned_distance"
                    name="planned_distance"
                    type="number"
                    required
                    min={1}
                    value={formState.planned_distance || ''}
                    onChange={handleInputChange}
                    placeholder="38"
                    className="input input-bordered w-full text-sm tabular-nums rounded-lg"
                  />
                </div>
              </div>

              {/* ========================================================= */}
              {/* CONDITIONAL VALIDATION (GREEN CIRCLE IN MOCKUP)           */}
              {/* ========================================================= */}
              {isCapacityExceeded && selectedVehicle && (
                <div className="rounded-xl border border-error/40 bg-error/10 p-4 text-xs text-error space-y-1 shadow-2xs transition-all">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Vehicle Capacity: {selectedVehicle.max_load_capacity.toLocaleString()} kg</span>
                    <span>Cargo Weight: {formState.cargo_weight.toLocaleString()} kg</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold pt-1">
                    <XCircle size={16} weight="fill" className="shrink-0" />
                    <span>
                      Capacity exceeded by {capacityExceededBy.toLocaleString()} kg &mdash; dispatch blocked
                    </span>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-base-300/60">
                <button
                  type="submit"
                  disabled={isSubmitting || isCapacityExceeded}
                  className={`btn btn-sm rounded-full px-6 font-semibold shadow-sm transition-all ${
                    isCapacityExceeded
                      ? 'btn-disabled bg-base-300 text-base-content/40 cursor-not-allowed'
                      : 'btn-warning'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : isCapacityExceeded ? (
                    'Dispatch (disabled)'
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <PaperPlaneRight size={16} weight="bold" />
                      <span>Dispatch Trip</span>
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="btn btn-ghost btn-sm rounded-full px-5 font-medium text-base-content/60 hover:text-base-content"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Interactive Live Board Trip List          */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-2">
              Live Board
              <span className="badge badge-sm badge-neutral font-mono px-2">
                {trips.length}
              </span>
            </h2>
            <span className="text-xs text-base-content/40 font-medium">
              Click any card to view dynamic lifecycle
            </span>
          </div>

          {isLoading ? (
            // Skeleton loader for live board cards
            <div className="space-y-3.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card bg-base-200/60 border border-base-300 p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between">
                    <div className="skeleton h-4 w-20" />
                    <div className="skeleton h-4 w-32" />
                  </div>
                  <div className="skeleton h-5 w-64" />
                  <div className="flex justify-between pt-1">
                    <div className="skeleton h-6 w-24 rounded-md" />
                    <div className="skeleton h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : trips.length === 0 ? (
            <div className="card bg-base-200/50 border border-base-300 p-12 text-center rounded-2xl">
              <Path size={40} weight="duotone" className="mx-auto text-base-content/30 mb-2.5" />
              <h3 className="text-sm font-semibold text-base-content/70">No Active Trips Found</h3>
              <p className="text-xs text-base-content/40 mt-1">
                Create a new trip from the form on the left to start dispatching.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {trips.map((trip) => {
                const isSelected = trip.id === selectedTripId
                const statusInfo = STATUS_BADGE_CONFIG[trip.status] || {
                  label: trip.status,
                  badgeClass: 'badge-ghost',
                }

                // Format vehicle & driver display name
                const vehicleDisplay =
                  typeof trip.vehicle === 'object' && trip.vehicle?.name_model
                    ? trip.vehicle.name_model
                    : typeof trip.vehicle === 'string'
                      ? (trip.vehicle as string)
                      : 'Unassigned'

                const driverDisplay =
                  typeof trip.driver === 'object' && trip.driver?.name
                    ? trip.driver.name.toUpperCase()
                    : typeof trip.driver === 'string'
                      ? (trip.driver as string).toUpperCase()
                      : ''

                const combinedInfo =
                  driverDisplay && vehicleDisplay !== 'Unassigned'
                    ? `${vehicleDisplay} / ${driverDisplay}`
                    : vehicleDisplay !== 'Unassigned'
                      ? vehicleDisplay
                      : 'Unassigned'

                return (
                  <div
                    key={trip.id}
                    onClick={() => setSelectedTripId((prev) => (prev === trip.id ? null : trip.id))}
                    className={`card p-5 rounded-2xl shadow-2xs transition-all duration-200 cursor-pointer group select-none ${
                      isSelected
                        ? 'bg-info/15 border-2 border-info shadow-md ring-2 ring-info/20'
                        : 'bg-base-200/70 border border-base-300/80 hover:border-info/40'
                    }`}
                  >
                    {/* Card Top Row: Trip ID & Vehicle/Driver */}
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-base-content/80 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-info tracking-wider">{trip.id}</span>
                        {isSelected && (
                          <span className="badge badge-xs badge-info font-sans uppercase font-bold tracking-widest px-1.5 py-1">
                            Selected
                          </span>
                        )}
                      </div>
                      <span className="text-base-content/60">{combinedInfo}</span>
                    </div>

                    {/* Card Middle Row: Route */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-base-content mb-4">
                      <span className="text-base-content/90">{trip.source}</span>
                      <ArrowRight size={15} weight="bold" className="text-base-content/40 shrink-0" />
                      <span className="text-base-content/90">{trip.destination}</span>
                    </div>

                    {/* Card Bottom Row: Status Badge & Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-base-300/50">
                      <div className="flex items-center gap-2.5">
                        <span className={`badge badge-sm px-3 py-2.5 rounded-md ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>

                        {/* Dispatch Now — for draft trips */}
                        {trip.status === 'draft' && (
                          <button
                            type="button"
                            onClick={(e) => handleQuickDispatch(trip.id, e)}
                            className="btn btn-xs btn-info btn-outline rounded-full font-semibold px-2.5"
                          >
                            Dispatch
                          </button>
                        )}

                        {/* Complete — for dispatched trips */}
                        {trip.status === 'dispatched' && (
                          <button
                            type="button"
                            onClick={(e) => handleCompleteTrip(trip.id, e)}
                            className="btn btn-xs btn-success btn-outline rounded-full font-semibold px-2.5"
                          >
                            <CheckCircle size={13} weight="bold" />
                            Complete
                          </button>
                        )}

                        {/* Cancel — for draft or dispatched trips */}
                        {(trip.status === 'draft' || trip.status === 'dispatched') && (
                          <button
                            type="button"
                            onClick={(e) => handleCancelTrip(trip.id, e)}
                            className="btn btn-xs btn-error btn-outline rounded-full font-semibold px-2.5"
                          >
                            <XCircle size={13} weight="bold" />
                            Cancel
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-base-content/60 font-medium">
                        {trip.status === 'dispatched' && (
                          <Clock size={14} weight="duotone" className="text-base-content/40" />
                        )}
                        <span>
                          {trip.status === 'completed'
                            ? 'Completed'
                            : trip.status === 'cancelled'
                              ? 'Cancelled'
                              : trip.status === 'dispatched'
                                ? 'In transit'
                                : 'Pending dispatch'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
