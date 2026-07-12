import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import {
  Funnel,
  MagnifyingGlass,
  Plus,
  Truck,
  WarningCircle,
  X,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'motion/react'
import { fetchVehicles, createVehicle } from '../services/vehicleService'
import type { Vehicle, CreateVehiclePayload, VehicleStatus } from '../types/api'

// -------------------------------------------------
// Constants & Mock Fallback Data
// -------------------------------------------------

const MOCK_VEHICLES: Vehicle[] = [
  {
    id: '1',
    registration_number: 'GJ01AB4521',
    name_model: 'VAN-05',
    vehicle_type: 'Van',
    max_load_capacity: 500,
    odometer: 74000,
    acquisition_cost: 620000,
    status: 'available',
  },
  {
    id: '2',
    registration_number: 'GJ01AB9981',
    name_model: 'TRUCK-11',
    vehicle_type: 'Truck',
    max_load_capacity: 5000,
    odometer: 182000,
    acquisition_cost: 2450000,
    status: 'on_trip',
  },
  {
    id: '3',
    registration_number: 'GJ01AB1120',
    name_model: 'MINI-03',
    vehicle_type: 'Mini',
    max_load_capacity: 1000,
    odometer: 66000,
    acquisition_cost: 410000,
    status: 'in_shop',
  },
  {
    id: '4',
    registration_number: 'GJ01AB0087',
    name_model: 'VAN-09',
    vehicle_type: 'Van',
    max_load_capacity: 750,
    odometer: 241900,
    acquisition_cost: 590000,
    status: 'retired',
  },
]

const STATUS_CONFIG: Record<VehicleStatus, { label: string; badgeClass: string }> = {
  available: { label: 'Available', badgeClass: 'badge-success' },
  on_trip: { label: 'On Trip', badgeClass: 'badge-info' },
  in_shop: { label: 'In Shop', badgeClass: 'badge-warning' },
  retired: { label: 'Retired', badgeClass: 'badge-error' },
}

const VEHICLE_TYPES = ['Van', 'Truck', 'Mini', 'Bus', 'Trailer'] as const

// -------------------------------------------------
// Component
// -------------------------------------------------

export function Vehicles() {
  // Table State
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters State
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // Form State
  const [formState, setFormState] = useState<CreateVehiclePayload>({
    registration_number: '',
    name_model: '',
    vehicle_type: 'Van',
    max_load_capacity: 1000,
    odometer: 0,
    acquisition_cost: 500000,
  })

  // ---- Load Vehicles ----
  async function loadVehicles() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchVehicles({
        type: typeFilter,
        status: statusFilter,
      })
      setVehicles(data)
    } catch {
      // Fallback to mock data if API is not running/accessible
      setVehicles(MOCK_VEHICLES)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadVehicles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter])

  // ---- Handlers ----
  function handleFormChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target
    if (name === 'registration_number') {
      // Strictly alphanumeric (A-Z, 0-9), stripping symbols like @, #, $, spaces, etc.
      const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
      setFormState((prev) => ({ ...prev, [name]: cleanValue }))
      return
    }
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  async function handleCreateVehicle(e: FormEvent) {
    e.preventDefault()
    setModalError(null)
    setIsSubmitting(true)

    try {
      await createVehicle(formState)
      setIsModalOpen(false)
      resetForm()
      await loadVehicles()
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : 'Failed to save vehicle. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setFormState({
      registration_number: '',
      name_model: '',
      vehicle_type: 'Van',
      max_load_capacity: 1000,
      odometer: 0,
      acquisition_cost: 500000,
    })
    setModalError(null)
  }

  function openModal() {
    resetForm()
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    resetForm()
  }

  // ---- Filtered Vehicles (Local search by reg no) ----
  const filteredVehicles = vehicles.filter((v) => {
    if (!searchQuery) return true
    return v.registration_number
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-6">
      {/* ---- Page Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-base-content flex items-center gap-2.5">
            <Truck size={26} weight="duotone" style={{ color: '#088370' }} />
            Vehicle Registry
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Manage fleet vehicles, capacity, acquisition costs, and status
          </p>
        </div>

        {/* Refresh button if needed */}
        <button
          type="button"
          onClick={loadVehicles}
          className="btn btn-ghost btn-sm text-base-content/60 self-start sm:self-auto"
          title="Refresh Data"
        >
          <ArrowsClockwise size={18} weight="duotone" />
        </button>
      </div>

      {/* ---- Action Bar ---- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-base-200/50 p-4 rounded-xl border border-base-300">
        {/* Left Filters (Single horizontal line) */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-base-content/50 shrink-0">
            <Funnel size={16} weight="duotone" />
            Filters
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="select select-bordered select-sm text-sm w-36 shrink-0 rounded-lg"
          >
            <option value="All">Type: All</option>
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-bordered select-sm text-sm w-40 shrink-0 rounded-lg"
          >
            <option value="All">Status: All</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>

          <label className="input input-bordered input-sm flex items-center gap-2 w-60 shrink-0 rounded-lg">
            <MagnifyingGlass size={16} weight="duotone" className="text-base-content/40 shrink-0" />
            <input
              type="text"
              placeholder="Search reg. no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="grow bg-transparent text-sm min-w-0"
            />
          </label>
        </div>

        {/* Right Action Button */}
        <button
          type="button"
          onClick={openModal}
          className="btn btn-warning btn-sm sm:btn-md rounded-full px-5 font-semibold shadow-sm flex items-center gap-2"
        >
          <Plus size={18} weight="bold" />
          Add Vehicle
        </button>
      </div>

      {/* ---- Error Alert (Table) ---- */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-error/30 bg-error/10 px-4 py-3">
          <WarningCircle size={20} weight="duotone" className="text-error shrink-0" />
          <p className="text-xs font-medium text-error">{error}</p>
        </div>
      )}

      {/* ---- Data Table ---- */}
      <div className="card bg-base-200 border border-base-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-sm sm:table-md w-full">
            <thead>
              <tr className="border-b border-base-300 text-xs uppercase tracking-wider text-base-content/40 bg-base-300/40">
                <th className="font-semibold py-3 pl-5">REG. NO. (UNIQUE)</th>
                <th className="font-semibold py-3">NAME/MODEL</th>
                <th className="font-semibold py-3">TYPE</th>
                <th className="font-semibold py-3">CAPACITY</th>
                <th className="font-semibold py-3">ODOMETER</th>
                <th className="font-semibold py-3">ACQ. COST</th>
                <th className="font-semibold py-3 pr-5">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-300/50">
              {isLoading ? (
                // Skeleton loading state
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="pl-5 py-4"><div className="skeleton h-4 w-24" /></td>
                    <td><div className="skeleton h-4 w-20" /></td>
                    <td><div className="skeleton h-4 w-14" /></td>
                    <td><div className="skeleton h-4 w-16" /></td>
                    <td><div className="skeleton h-4 w-20" /></td>
                    <td><div className="skeleton h-4 w-24" /></td>
                    <td className="pr-5"><div className="skeleton h-6 w-20 rounded-full" /></td>
                  </tr>
                ))
              ) : filteredVehicles.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={7} className="text-center py-12 text-base-content/40 text-sm">
                    No vehicles found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const statusInfo = STATUS_CONFIG[vehicle.status] || {
                    label: vehicle.status,
                    badgeClass: 'badge-ghost',
                  }
                  return (
                    <tr key={vehicle.id} className="hover transition-colors">
                      <td className="font-mono font-medium text-base-content pl-5">
                        {vehicle.registration_number}
                      </td>
                      <td className="font-medium text-base-content/80">
                        {vehicle.name_model}
                      </td>
                      <td className="text-base-content/70">{vehicle.vehicle_type}</td>
                      <td className="text-base-content/70 tabular-nums">
                        {vehicle.max_load_capacity >= 1000
                          ? `${(vehicle.max_load_capacity / 1000).toLocaleString()} Ton`
                          : `${vehicle.max_load_capacity.toLocaleString()} kg`}
                      </td>
                      <td className="text-base-content/70 tabular-nums">
                        {vehicle.odometer.toLocaleString()} km
                      </td>
                      <td className="text-base-content/70 tabular-nums font-mono">
                        ₹{vehicle.acquisition_cost.toLocaleString('en-IN')}
                      </td>
                      <td className="pr-5">
                        <span className={`badge badge-sm font-semibold px-3 py-2.5 rounded-md shadow-2xs ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
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

      {/* ---- Add Vehicle Modal with framer-motion AnimatePresence ---- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={closeModal}
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-lg rounded-2xl bg-base-100 border border-base-300 shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-base-300 px-6 py-4 bg-base-200/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: '#0883701a', color: '#088370' }}>
                    <Truck size={20} weight="duotone" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base-content">Add New Vehicle</h3>
                    <p className="text-xs text-base-content/50">
                      Register a vehicle in the fleet database
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-base-content"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleCreateVehicle} className="p-6 space-y-4">
                {modalError && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-error/30 bg-error/10 px-3.5 py-2.5 text-xs text-error font-medium">
                    <WarningCircle size={18} weight="duotone" className="shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Registration Number */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="reg_no"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                    >
                      Registration Number (Unique) <span className="text-error">*</span>
                    </label>
                    <input
                      id="reg_no"
                      name="registration_number"
                      type="text"
                      required
                      pattern="[A-Z0-9]+"
                      maxLength={15}
                      title="Only alphanumeric characters allowed (no symbols or spaces)"
                      placeholder="e.g. GJ01AB5520"
                      value={formState.registration_number}
                      onChange={handleFormChange}
                      className="input input-bordered w-full text-sm font-mono uppercase rounded-lg"
                    />
                  </div>

                  {/* Name/Model */}
                  <div>
                    <label
                      htmlFor="name_model"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                    >
                      Name / Model <span className="text-error">*</span>
                    </label>
                    <input
                      id="name_model"
                      name="name_model"
                      type="text"
                      required
                      placeholder="e.g. VAN-10 or Tata Ace"
                      value={formState.name_model}
                      onChange={handleFormChange}
                      className="input input-bordered w-full text-sm rounded-lg"
                    />
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <label
                      htmlFor="vehicle_type"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                    >
                      Vehicle Type <span className="text-error">*</span>
                    </label>
                    <select
                      id="vehicle_type"
                      name="vehicle_type"
                      value={formState.vehicle_type}
                      onChange={handleFormChange}
                      className="select select-bordered w-full text-sm rounded-lg"
                    >
                      {VEHICLE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Max Load Capacity */}
                  <div>
                    <label
                      htmlFor="max_load_capacity"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                    >
                      Max Capacity (kg) <span className="text-error">*</span>
                    </label>
                    <input
                      id="max_load_capacity"
                      name="max_load_capacity"
                      type="number"
                      required
                      min={100}
                      step={50}
                      value={formState.max_load_capacity}
                      onChange={handleFormChange}
                      className="input input-bordered w-full text-sm tabular-nums rounded-lg"
                    />
                  </div>

                  {/* Initial Odometer */}
                  <div>
                    <label
                      htmlFor="odometer"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                    >
                      Initial Odometer (km) <span className="text-error">*</span>
                    </label>
                    <input
                      id="odometer"
                      name="odometer"
                      type="number"
                      required
                      min={0}
                      value={formState.odometer}
                      onChange={handleFormChange}
                      className="input input-bordered w-full text-sm tabular-nums rounded-lg"
                    />
                  </div>

                  {/* Acquisition Cost */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="acquisition_cost"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                    >
                      Acquisition Cost (₹) <span className="text-error">*</span>
                    </label>
                    <input
                      id="acquisition_cost"
                      name="acquisition_cost"
                      type="number"
                      required
                      min={0}
                      step={1000}
                      value={formState.acquisition_cost}
                      onChange={handleFormChange}
                      className="input input-bordered w-full text-sm tabular-nums rounded-lg"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-300">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="btn btn-ghost btn-sm rounded-full px-5 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-warning btn-sm rounded-full px-6 font-semibold shadow-sm"
                  >
                    {isSubmitting ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      'Save Vehicle'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
