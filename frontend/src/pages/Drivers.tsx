import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import {
  Funnel,
  MagnifyingGlass,
  Plus,
  UsersThree,
  WarningCircle,
  X,
  ArrowsClockwise,
  Circle,
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'motion/react'
import { fetchDrivers, createDriver, updateDriverStatus } from '../services/driverService'
import type { Driver, DriverStatus } from '../types/models'
import type { CreateDriverPayload } from '../types/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/feedback/Toast'
import { ConfirmDialog } from '../components/feedback/ConfirmDialog'

// -------------------------------------------------
// Constants
// -------------------------------------------------

const STATUS_CONFIG: Record<DriverStatus, { label: string; badgeClass: string }> = {
  available: { label: 'Available', badgeClass: 'badge-success' },
  on_trip:   { label: 'On Trip',   badgeClass: 'badge-info' },
  off_duty:  { label: 'Off Duty',  badgeClass: 'badge-neutral' },
  suspended: { label: 'Suspended', badgeClass: 'badge-error' },
}

const STATUS_TOGGLE: { status: DriverStatus; label: string; btnClass: string }[] = [
  { status: 'available', label: 'Available', btnClass: 'btn-success' },
  { status: 'on_trip',   label: 'On Trip',   btnClass: 'btn-info' },
  { status: 'off_duty',  label: 'Off Duty',  btnClass: 'btn-neutral' },
  { status: 'suspended', label: 'Suspended', btnClass: 'btn-error' },
]

const LICENSE_CATEGORIES = ['LMV', 'HMV', 'MCWG', 'TRANS', 'PSV'] as const

function isExpired(dateStr: string): boolean {
  return new Date(dateStr) < new Date()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// -------------------------------------------------
// Component
// -------------------------------------------------

export function Drivers() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const isSafetyOfficer = user?.role === 'Safety Officer'

  // Table State
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters State
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Row Selection
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)

  // Status Toggle State
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [confirmSuspendOpen, setConfirmSuspendOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<DriverStatus | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // Form State
  const [formState, setFormState] = useState<CreateDriverPayload>({
    name: '',
    license_number: '',
    license_category: 'LMV',
    license_expiry_date: '',
    contact_number: '',
    safety_score: 80,
  })

  // ---- Load Drivers ----
  async function loadDrivers() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchDrivers()
      setDrivers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drivers.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadDrivers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Form Handlers ----
  function handleFormChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const sanitizedValue = name === 'name' ? value.replace(/[^a-zA-Z0-9 ]/g, '') : value
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(sanitizedValue) : sanitizedValue,
    }))
  }

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    const sanitized = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '')
    setFormState((prev) => ({
      ...prev,
      name: sanitized,
    }))
  }

  async function handleCreateDriver(e: FormEvent) {
    e.preventDefault()
    setModalError(null)
    setIsSubmitting(true)
    try {
      await createDriver(formState)
      setIsModalOpen(false)
      resetForm()
      showToast('Driver added successfully.', 'success')
      await loadDrivers()
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : 'Failed to save driver. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setFormState({
      name: '',
      license_number: '',
      license_category: 'LMV',
      license_expiry_date: '',
      contact_number: '',
      safety_score: 80,
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

  // ---- Status Toggle ----
  function handleToggleClick(option: (typeof STATUS_TOGGLE)[number]) {
    if (!selectedDriver) return
    if (option.status === 'suspended') {
      setPendingStatus('suspended')
      setConfirmSuspendOpen(true)
    } else {
      void applyStatus(option.status)
    }
  }

  async function applyStatus(status: DriverStatus) {
    if (!selectedDriver) return
    setIsTogglingStatus(true)
    try {
      await updateDriverStatus(selectedDriver.id, status)
      showToast(`Status updated to "${status.replace('_', ' ')}" successfully.`, 'success')
      await loadDrivers()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update status.', 'error')
    } finally {
      setIsTogglingStatus(false)
      setConfirmSuspendOpen(false)
      setPendingStatus(null)
    }
  }

  // ---- Filtered Drivers ----
  const filteredDrivers = drivers.filter((d) => {
    const matchCategory = categoryFilter === 'All' || d.license_category === categoryFilter
    const matchStatus =
      statusFilter === 'All' || d.status === statusFilter.toLowerCase().replace(' ', '_')
    const matchSearch =
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.license_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.contact_number.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchStatus && matchSearch
  })

  return (
    <div className="space-y-6">
      {/* ---- Page Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-base-content flex items-center gap-2.5">
            <UsersThree size={26} weight="duotone" style={{ color: '#088370' }} />
            Drivers &amp; Safety Profiles
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Manage driver records, licenses, safety scores, and status
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadDrivers()}
          className="btn btn-ghost btn-sm text-base-content/60 self-start sm:self-auto"
          title="Refresh Data"
        >
          <ArrowsClockwise size={18} weight="duotone" />
        </button>
      </div>

      {/* ---- Action Bar ---- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-base-200/50 p-4 rounded-xl border border-base-300">
        {/* Left Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-base-content/50 shrink-0">
            <Funnel size={16} weight="duotone" />
            Filters
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select select-bordered select-sm text-sm w-40 shrink-0 rounded-lg"
          >
            <option value="All">Category: All</option>
            {LICENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-bordered select-sm text-sm w-44 shrink-0 rounded-lg"
          >
            <option value="All">Status: All</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="off_duty">Off Duty</option>
            <option value="suspended">Suspended</option>
          </select>

          <label className="input input-bordered input-sm flex items-center gap-2 w-60 shrink-0 rounded-lg">
            <MagnifyingGlass size={16} weight="duotone" className="text-base-content/40 shrink-0" />
            <input
              type="text"
              placeholder="Search name or license..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="grow bg-transparent text-sm min-w-0"
            />
          </label>
        </div>

        {/* Right Action Button — Safety Officer only */}
        {isSafetyOfficer && (
          <button
            type="button"
            onClick={openModal}
            className="btn btn-primary btn-sm sm:btn-md rounded-full px-5 font-semibold shadow-sm flex items-center gap-2"
          >
            <Plus size={18} weight="bold" />
            Add Driver
          </button>
        )}
      </div>

      {/* ---- Error Alert ---- */}
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
                <th className="font-semibold py-3 pl-5">Driver</th>
                <th className="font-semibold py-3">License No.</th>
                <th className="font-semibold py-3">Category</th>
                <th className="font-semibold py-3">Expiry</th>
                <th className="font-semibold py-3">Contact</th>
                <th className="font-semibold py-3">Trip Compl.</th>
                <th className="font-semibold py-3">Safety</th>
                <th className="font-semibold py-3 pr-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-300/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="pl-5 py-4"><div className="skeleton h-4 w-28" /></td>
                    <td><div className="skeleton h-4 w-28" /></td>
                    <td><div className="skeleton h-4 w-12" /></td>
                    <td><div className="skeleton h-4 w-20" /></td>
                    <td><div className="skeleton h-4 w-28" /></td>
                    <td><div className="skeleton h-4 w-8" /></td>
                    <td><div className="skeleton h-4 w-12" /></td>
                    <td className="pr-5"><div className="skeleton h-6 w-20 rounded-full" /></td>
                  </tr>
                ))
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-base-content/40 text-sm">
                    No drivers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => {
                  const statusInfo = STATUS_CONFIG[driver.status]
                  const expired = isExpired(driver.license_expiry_date)
                  const isSelected = selectedDriver?.id === driver.id
                  return (
                    <tr
                      key={driver.id}
                      onClick={() => setSelectedDriver(isSelected ? null : driver)}
                      className={`cursor-pointer transition-colors ${isSelected ? 'bg-base-200' : 'hover'}`}
                    >
                      <td className="font-medium text-base-content pl-5">
                        {driver.name}
                      </td>
                      <td className="font-mono text-xs text-base-content/80">
                        {driver.license_number}
                      </td>
                      <td>
                        <span className="badge badge-ghost badge-sm font-medium">
                          {driver.license_category}
                        </span>
                      </td>
                      <td>
                        <span className={`flex items-center gap-1 text-sm ${expired ? 'text-error font-medium' : 'text-base-content/70'}`}>
                          {expired && <WarningCircle size={13} weight="bold" className="shrink-0" />}
                          {formatDate(driver.license_expiry_date)}
                          {expired && <span className="text-xs font-bold">EXPIRED</span>}
                        </span>
                      </td>
                      <td className="text-base-content/70">{driver.contact_number}</td>
                      <td className="text-base-content/40 text-sm">—</td>
                      <td>
                        <span className="badge badge-ghost badge-sm font-medium tabular-nums">
                          {driver.safety_score}%
                        </span>
                      </td>
                      <td className="pr-5">
                        <span className={`badge badge-sm font-semibold px-3 py-2.5 rounded-md shadow-2xs gap-1 ${statusInfo.badgeClass}`}>
                          <Circle size={8} weight="fill" />
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

      {/* ---- Toggle Status Bar — Safety Officer only ---- */}
      {isSafetyOfficer && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-base-300 bg-base-200/50 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50 shrink-0">
            Toggle Status
          </span>
          <div className="flex flex-wrap gap-2">
            {STATUS_TOGGLE.map((opt) => (
              <button
                key={opt.status}
                type="button"
                className={`btn btn-sm rounded-full px-4 font-semibold ${opt.btnClass} ${!selectedDriver ? 'opacity-40 btn-disabled' : ''}`}
                disabled={!selectedDriver || isTogglingStatus}
                onClick={() => handleToggleClick(opt)}
              >
                {isTogglingStatus && pendingStatus === opt.status && (
                  <span className="loading loading-spinner loading-xs" />
                )}
                {opt.label}
              </button>
            ))}
          </div>
          {selectedDriver ? (
            <span className="text-xs text-base-content/50 ml-auto">
              Selected: <strong>{selectedDriver.name}</strong>
            </span>
          ) : (
            <span className="text-xs text-base-content/40 ml-auto">
              Select a row to toggle status
            </span>
          )}
        </div>
      )}

      {/* ---- Confirm Suspend Dialog ---- */}
      <ConfirmDialog
        open={confirmSuspendOpen}
        title="Suspend Driver?"
        description={`Are you sure you want to suspend ${selectedDriver?.name ?? 'this driver'}? Suspended drivers are blocked from trip assignment.`}
        confirmLabel="Suspend"
        cancelLabel="Cancel"
        onConfirm={() => void applyStatus('suspended')}
        onCancel={() => {
          setConfirmSuspendOpen(false)
          setPendingStatus(null)
        }}
        loading={isTogglingStatus}
      />

      {/* ---- Add Driver Modal ---- */}
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
                    <UsersThree size={20} weight="duotone" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base-content">Add New Driver</h3>
                    <p className="text-xs text-base-content/50">
                      Register a driver in the fleet database
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
              <form onSubmit={(e) => void handleCreateDriver(e)} className="p-6 space-y-4">
                {modalError && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-error/30 bg-error/10 px-3.5 py-2.5 text-xs text-error font-medium">
                    <WarningCircle size={18} weight="duotone" className="shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="driver_name"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                    >
                      Full Name <span className="text-error">*</span>
                    </label>
                    <input
                      id="driver_name"
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. Arjun Mehta"
                      value={formState.name}
                      onChange={handleNameChange}
                      className="input input-bordered w-full text-sm rounded-lg"
                    />
                  </div>

                  {/* License Number */}
                  <div>
                    <label
                      htmlFor="license_number"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                    >
                      License Number <span className="text-error">*</span>
                    </label>
                    <input
                      id="license_number"
                      name="license_number"
                      type="text"
                      required
                      placeholder="e.g. MH-1234567890"
                      value={formState.license_number}
                      onChange={handleFormChange}
                      className="input input-bordered w-full text-sm font-mono rounded-lg"
                    />
                  </div>

                  {/* License Category */}
                  <div>
                    <label
                      htmlFor="license_category"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                    >
                      License Category <span className="text-error">*</span>
                    </label>
                    <select
                      id="license_category"
                      name="license_category"
                      value={formState.license_category}
                      onChange={handleFormChange}
                      className="select select-bordered w-full text-sm rounded-lg"
                    >
                      {LICENSE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label
                      htmlFor="license_expiry_date"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                    >
                      License Expiry Date <span className="text-error">*</span>
                    </label>
                    <input
                      id="license_expiry_date"
                      name="license_expiry_date"
                      type="date"
                      required
                      value={formState.license_expiry_date}
                      onChange={handleFormChange}
                      className="input input-bordered w-full text-sm rounded-lg"
                    />
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label
                      htmlFor="contact_number"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                    >
                      Contact Number <span className="text-error">*</span>
                    </label>
                    <input
                      id="contact_number"
                      name="contact_number"
                      type="text"
                      required
                      placeholder="e.g. +91 98200 11111"
                      value={formState.contact_number}
                      onChange={handleFormChange}
                      className="input input-bordered w-full text-sm rounded-lg"
                    />
                  </div>

                  {/* Safety Score */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="safety_score"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60"
                    >
                      Safety Score (0–100) <span className="text-error">*</span>
                    </label>
                    <input
                      id="safety_score"
                      name="safety_score"
                      type="number"
                      required
                      min={0}
                      max={100}
                      step={1}
                      value={formState.safety_score}
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
                    className="btn btn-primary btn-sm rounded-full px-6 font-semibold shadow-sm"
                  >
                    {isSubmitting ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      'Save Driver'
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
