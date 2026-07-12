import { useState, useEffect, type FormEvent } from 'react'
import {
  Wrench,
  Plus,
  MagnifyingGlass,
  ArrowsClockwise,
  CheckCircle,
  WarningCircle,
  X,
  Truck,
  CurrencyInr,
  CalendarBlank,
  Tag,
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'motion/react'
import { fetchVehicles } from '../services/vehicleService'
import {
  fetchMaintenanceRecords,
  createMaintenanceRecord,
  closeMaintenanceRecord,
} from '../services/maintenanceService'
import { useToast } from '../components/feedback/Toast'
import type { Vehicle, MaintenanceRecord } from '../types/api'

export function Maintenance() {
  const { showToast } = useToast()

  // -------------------------------------------------
  // Data State
  // -------------------------------------------------
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([])
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)
  const [isLoadingRecords, setIsLoadingRecords] = useState(true)

  // -------------------------------------------------
  // Form State (Controlled)
  // -------------------------------------------------
  const [vehicleId, setVehicleId] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // -------------------------------------------------
  // Table Filtering & Search State
  // -------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('')

  // -------------------------------------------------
  // Close Ticket Modal State
  // -------------------------------------------------
  const [closingRecord, setClosingRecord] = useState<MaintenanceRecord | null>(null)
  const [finalCostInput, setFinalCostInput] = useState('')
  const [isClosing, setIsClosing] = useState(false)
  const [closeError, setCloseError] = useState<string | null>(null)

  // -------------------------------------------------
  // Data Fetching Helpers
  // -------------------------------------------------
  const loadAvailableVehicles = async () => {
    setIsLoadingVehicles(true)
    try {
      // Critical Frontend Logic: Fetch strictly vehicles where status = 'available'
      const data = await fetchVehicles({ status: 'available' })
      setAvailableVehicles(data)
      // If our current selection is not available, pick first available or empty
      if (data.length > 0 && (!vehicleId || !data.some((v) => v.id === vehicleId))) {
        setVehicleId(data[0]?.id || '')
      } else if (data.length === 0) {
        setVehicleId('')
      }
    } catch (err) {
      console.warn('Failed to fetch available vehicles from API, using fallback:', err)
      // Fallback available vehicles if backend offline
      const mockAvail: Vehicle[] = [
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
      ]
      setAvailableVehicles(mockAvail)
      if (!vehicleId && mockAvail.length > 0) {
        setVehicleId(mockAvail[0]?.id || '')
      }
    } finally {
      setIsLoadingVehicles(false)
    }
  }

  const loadMaintenanceRecords = async () => {
    setIsLoadingRecords(true)
    try {
      const data = await fetchMaintenanceRecords()
      setMaintenanceRecords(data)
    } catch (err) {
      console.error('Failed to fetch maintenance records:', err)
      showToast('Could not refresh service logs.', 'error')
    } finally {
      setIsLoadingRecords(false)
    }
  }

  useEffect(() => {
    loadAvailableVehicles()
    loadMaintenanceRecords()
  }, [])

  // -------------------------------------------------
  // Handlers
  // -------------------------------------------------
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!vehicleId) {
      setFormError('Please select a vehicle.')
      return
    }
    if (!description.trim()) {
      setFormError('Please enter a service description.')
      return
    }
    const numericCost = Number(cost)
    if (isNaN(numericCost) || numericCost < 0) {
      setFormError('Please enter a valid non-negative cost.')
      return
    }

    setIsSubmitting(true)
    try {
      await createMaintenanceRecord({
        vehicle_id: vehicleId,
        description: description.trim(),
        cost: numericCost,
      })

      showToast('Service record logged successfully!', 'success')
      // Clear form inputs
      setDescription('')
      setCost('')
      // Refresh both tables and available vehicles list
      await Promise.all([loadMaintenanceRecords(), loadAvailableVehicles()])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create service record.'
      setFormError(msg)
      showToast(msg, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCloseTicketModal = (record: MaintenanceRecord) => {
    setClosingRecord(record)
    setFinalCostInput(record.cost !== undefined ? String(record.cost) : '0')
    setCloseError(null)
  }

  const handleConfirmCloseTicket = async (e: FormEvent) => {
    e.preventDefault()
    if (!closingRecord) return

    const numericCost = Number(finalCostInput)
    if (isNaN(numericCost) || numericCost < 0) {
      setCloseError('Please enter a valid non-negative cost.')
      return
    }

    setIsClosing(true)
    setCloseError(null)
    try {
      await closeMaintenanceRecord(closingRecord.id, {
        cost: numericCost,
        closed_at: new Date().toISOString(),
      })

      showToast('Maintenance ticket closed successfully.', 'success')
      setClosingRecord(null)
      // Refresh maintenance table and available vehicles (releasing vehicle back to available)
      await Promise.all([loadMaintenanceRecords(), loadAvailableVehicles()])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to close maintenance ticket.'
      setCloseError(msg)
      showToast(msg, 'error')
    } finally {
      setIsClosing(false)
    }
  }

  // Helper for status classification
  const isRecordOpen = (status: string) => {
    const s = status.toLowerCase()
    return s === 'open' || s === 'in_shop' || s === 'active'
  }

  // Filter maintenance records by search query
  const filteredRecords = maintenanceRecords.filter((rec) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const vehName = rec.vehicle?.name_model || ''
    const vehReg = rec.vehicle?.registration_number || ''
    const desc = rec.description || ''
    return (
      vehName.toLowerCase().includes(q) ||
      vehReg.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q)
    )
  })

  // Format today's date for read-only visual placeholder
  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Page Title & Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-base-300 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-base-content tracking-tight">Maintenance</h1>
          <p className="text-xs text-base-content/60 font-medium mt-0.5">
            Log vehicle repairs, track shop status, and complete service tickets
          </p>
        </div>
        <button
          onClick={() => {
            loadAvailableVehicles()
            loadMaintenanceRecords()
          }}
          disabled={isLoadingRecords || isLoadingVehicles}
          className="btn btn-ghost btn-sm rounded-full gap-2 self-start sm:self-center text-base-content/70 hover:text-primary"
          title="Refresh Data"
        >
          <ArrowsClockwise
            size={18}
            weight="duotone"
            className={isLoadingRecords || isLoadingVehicles ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form (Log Service Record) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5">
              <div className="flex items-center gap-2 border-b border-base-300/60 pb-3.5 mb-4">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#0883701a', color: '#088370' }}>
                  <Wrench size={18} weight="duotone" />
                </div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-base-content/70">
                  Log Service Record
                </h2>
              </div>

              {formError && (
                <div className="alert alert-error text-xs rounded-xl py-2.5 px-3 mb-4 font-medium flex items-center gap-2">
                  <WarningCircle size={16} weight="duotone" className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Vehicle Select Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-base-content/80 flex items-center gap-1.5">
                    <Truck size={14} weight="duotone" style={{ color: '#088370' }} />
                    Vehicle
                  </label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    disabled={isLoadingVehicles || availableVehicles.length === 0 || isSubmitting}
                    className="select select-bordered w-full text-sm font-medium bg-base-100 focus:border-primary"
                    required
                  >
                    {isLoadingVehicles ? (
                      <option value="">Loading available vehicles...</option>
                    ) : availableVehicles.length === 0 ? (
                      <option value="">No available vehicles in pool</option>
                    ) : (
                      <>
                        <option value="" disabled>
                          Select an available vehicle
                        </option>
                        {availableVehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name_model} ({v.registration_number})
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <p className="text-[11px] text-base-content/50">
                    Showing only vehicles with &quot;available&quot; status.
                  </p>
                </div>

                {/* Service Type / Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-base-content/80 flex items-center gap-1.5">
                    <Wrench size={14} weight="duotone" style={{ color: '#088370' }} />
                    Service Type
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Oil Change, Brake Repair"
                    disabled={isSubmitting}
                    className="input input-bordered w-full text-sm font-medium bg-base-100 focus:border-primary"
                    required
                  />
                </div>

                {/* Cost Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-base-content/80 flex items-center gap-1.5">
                    <CurrencyInr size={14} weight="duotone" style={{ color: '#088370' }} />
                    Cost (&#8377;)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="2500"
                    disabled={isSubmitting}
                    className="input input-bordered w-full text-sm font-medium bg-base-100 focus:border-primary"
                    required
                  />
                </div>

                {/* Read-Only Visual Placeholders (Date & Status per specification) */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-base-content/50 flex items-center gap-1">
                      <CalendarBlank size={12} weight="duotone" />
                      Date
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={todayFormatted}
                      className="input input-bordered input-sm w-full text-xs font-medium bg-base-200/60 text-base-content/60 cursor-not-allowed border-base-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-base-content/50 flex items-center gap-1">
                      <Tag size={12} weight="duotone" />
                      Status
                    </label>
                    <div className="input input-bordered input-sm w-full bg-base-200/60 border-base-300 flex items-center px-2.5 cursor-not-allowed">
                      <span className="badge badge-warning badge-xs gap-1 font-medium text-[10px] py-2">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoadingVehicles || availableVehicles.length === 0}
                    className="btn btn-warning w-full rounded-full gap-2 font-semibold shadow-sm"
                  >
                    <Plus size={18} weight="bold" />
                    {isSubmitting ? 'Logging...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* Note: Developer notes ("Available -> In Shop...") explicitly excluded as requested by Red Circle Exclusion */}
        </div>

        {/* Right Column: Service Log Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-base-300/60 pb-3.5 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#0883701a', color: '#088370' }}>
                    <Tag size={18} weight="duotone" />
                  </div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-base-content/70">
                    Service Log
                  </h2>
                </div>

                {/* Search / Filter Input */}
                <div className="relative w-full sm:w-64">
                  <MagnifyingGlass
                    size={16}
                    weight="duotone"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                  />
                  <input
                    type="text"
                    placeholder="Search vehicle or service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input input-bordered input-sm w-full pl-9 rounded-full text-xs font-medium bg-base-100 focus:border-primary"
                  />
                </div>
              </div>

              {/* Table Content */}
              {isLoadingRecords ? (
                <div className="flex flex-col items-center justify-center py-16 text-base-content/40 space-y-3">
                  <ArrowsClockwise size={32} weight="duotone" className="animate-spin text-primary" />
                  <p className="text-xs font-medium">Loading service logs...</p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-base-content/40 space-y-2 border border-dashed border-base-300 rounded-xl">
                  <Wrench size={40} weight="thin" className="text-base-content/30" />
                  <p className="text-sm font-medium text-base-content/60">No maintenance logs found</p>
                  <p className="text-xs text-base-content/40">
                    {searchQuery ? 'Try adjusting your search criteria.' : 'Log a service record using the form on the left.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table w-full text-sm">
                    <thead>
                      <tr className="border-b border-base-300 text-[11px] uppercase tracking-wider font-semibold text-base-content/60">
                        <th className="py-3 pl-3">Vehicle</th>
                        <th className="py-3">Service</th>
                        <th className="py-3">Cost</th>
                        <th className="py-3 text-right pr-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-base-200">
                      {filteredRecords.map((record) => {
                        const open = isRecordOpen(record.status)
                        const vehicleName =
                          record.vehicle?.name_model ||
                          record.vehicle?.registration_number ||
                          `Vehicle #${record.vehicle_id}`
                        const regNum = record.vehicle?.registration_number || ''

                        return (
                          <tr key={record.id} className="hover:bg-base-200/40 transition-colors">
                            {/* Vehicle Column */}
                            <td className="py-3.5 pl-3">
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-base-200 text-base-content/70 shrink-0">
                                  <Truck size={18} weight="duotone" />
                                </div>
                                <div>
                                  <div className="font-semibold text-base-content text-sm">
                                    {vehicleName}
                                  </div>
                                  {regNum && (
                                    <div className="text-[11px] text-base-content/50 font-mono mt-0.5">
                                      {regNum}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Description (Service) Column */}
                            <td className="py-3.5">
                              <span className="font-medium text-base-content/90">
                                {record.description}
                              </span>
                            </td>

                            {/* Cost Column */}
                            <td className="py-3.5 font-mono font-medium text-base-content/80">
                              &#8377;{(record.cost ?? 0).toLocaleString()}
                            </td>

                            {/* Status & Close Action Column */}
                            <td className="py-3.5 pr-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {open ? (
                                  <>
                                    <span className="badge badge-warning badge-sm gap-1.5 py-2.5 px-3 font-medium">
                                      <WarningCircle size={14} weight="duotone" />
                                      In Shop
                                    </span>
                                    <button
                                      onClick={() => openCloseTicketModal(record)}
                                      className="btn btn-xs btn-ghost border border-primary/30 text-primary hover:bg-primary hover:text-primary-content rounded-full gap-1 transition-all"
                                      title="Close Ticket & Return Vehicle to Pool"
                                    >
                                      <CheckCircle size={14} weight="bold" />
                                      <span>Close</span>
                                    </button>
                                  </>
                                ) : (
                                  <span className="badge badge-success badge-sm gap-1.5 py-2.5 px-3 font-medium">
                                    <CheckCircle size={14} weight="duotone" />
                                    Completed
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Close Ticket Modal (adhering strictly to section 9 Animation Policy) */}
      <AnimatePresence>
        {closingRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => !isClosing && setClosingRecord(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-md rounded-2xl bg-base-100 p-6 shadow-2xl border border-base-300"
            >
              <div className="flex items-center justify-between pb-4 border-b border-base-300">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-success/10 text-success">
                    <CheckCircle size={22} weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-base-content">
                      Close Maintenance Ticket
                    </h3>
                    <p className="text-xs text-base-content/60">
                      Verify final cost to mark ticket completed
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isClosing && setClosingRecord(null)}
                  className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content"
                  disabled={isClosing}
                >
                  <X size={18} />
                </button>
              </div>

              {closeError && (
                <div className="alert alert-error text-xs rounded-xl py-2.5 px-3 mt-4 font-medium">
                  {closeError}
                </div>
              )}

              <form onSubmit={handleConfirmCloseTicket} className="mt-4 space-y-4">
                <div className="bg-base-200/60 rounded-xl p-3.5 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-base-content/60 font-medium">Vehicle:</span>
                    <span className="font-semibold text-base-content">
                      {closingRecord.vehicle?.name_model ||
                        closingRecord.vehicle?.registration_number ||
                        `Vehicle #${closingRecord.vehicle_id}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60 font-medium">Service Type:</span>
                    <span className="font-semibold text-base-content">
                      {closingRecord.description}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-base-content/80 flex items-center gap-1.5">
                    <CurrencyInr size={14} weight="duotone" style={{ color: '#088370' }} />
                    Final Cost (&#8377;)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={finalCostInput}
                    onChange={(e) => setFinalCostInput(e.target.value)}
                    placeholder="Enter final cost..."
                    disabled={isClosing}
                    className="input input-bordered w-full text-sm font-medium bg-base-100 focus:border-primary"
                    required
                  />
                  <p className="text-[11px] text-base-content/50">
                    Entering this triggers status update and returns vehicle to the available pool.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-base-300">
                  <button
                    type="button"
                    onClick={() => setClosingRecord(null)}
                    disabled={isClosing}
                    className="btn btn-ghost btn-sm rounded-full px-4 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isClosing}
                    className="btn btn-warning btn-sm rounded-full px-5 gap-2 font-semibold shadow-sm"
                  >
                    <CheckCircle size={16} weight="bold" />
                    {isClosing ? 'Closing Ticket...' : 'Confirm & Close Ticket'}
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
