import React, { useState, useEffect, type ChangeEvent } from 'react'
import {
  GasPumpIcon as GasPump,
  ReceiptIcon as Receipt,
  PlusIcon as Plus,
  MagnifyingGlassIcon as MagnifyingGlass,
  FunnelIcon as Funnel,
  WarningCircleIcon as WarningCircle,
  XIcon as X,
  ArrowsClockwiseIcon as ArrowsClockwise,
  CurrencyInrIcon as CurrencyInr,
  CalendarBlankIcon as CalendarBlank,
  TruckIcon as Truck,
  ArrowRightIcon as ArrowRight,
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'motion/react'
import { fetchFuelLogs, createFuelLog, fetchExpenses, createExpense } from '../services/expenseService'
import { fetchVehicles } from '../services/vehicleService'
import { EXPENSE_TYPES } from '../types/expenses'
import type { FuelLog, Expense, CreateFuelLogPayload, CreateExpensePayload } from '../types/expenses'
import type { Vehicle } from '../types/api'

// -------------------------------------------------
// Helpers
// -------------------------------------------------

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
const fmtINR = (v: string | number | null | undefined) =>
  v == null ? '—' : INR.format(Number(v))

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function today() {
  return new Date().toISOString().split('T')[0]
}

// (Mock data removed — all data is loaded live from the API)

// -------------------------------------------------
// Modal: Add Fuel Log
// -------------------------------------------------

interface AddFuelModalProps {
  vehicles: Vehicle[]
  onClose: () => void
  onSuccess: () => void
}

// Store numeric fields as strings to avoid the "0500" prepend problem.
// They are parsed to numbers only at submit time.
interface FuelFormState {
  vehicle_id: number
  trip_id: null
  liters: string
  cost: string
  log_date: string
}

function AddFuelModal({ vehicles, onClose, onSuccess }: AddFuelModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FuelFormState>({
    vehicle_id: vehicles[0]?.id ?? 0,
    trip_id: null,
    liters: '',
    cost: '',
    log_date: today(),
  })

  // Allow only valid decimal numbers: optional leading digits, optional dot, optional trailing digits
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    const isNumericField = name === 'liters' || name === 'cost'
    if (isNumericField && value !== '' && !/^\d*\.?\d*$/.test(value)) return
    // vehicle_id must stay a number — HTML selects always produce strings
    if (name === 'vehicle_id') {
      setForm((prev) => ({ ...prev, vehicle_id: parseInt(value, 10) }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      // Convert date-only string ("YYYY-MM-DD") to a full ISO 8601 datetime
      // required by the Zod .datetime() validator on the backend.
      // Falls back to today if somehow the field is empty.
      const isoDate = form.log_date
        ? new Date(form.log_date + 'T00:00:00.000Z').toISOString()
        : new Date().toISOString()
      const payload: CreateFuelLogPayload = {
        vehicle_id: form.vehicle_id,
        trip_id: null,
        liters: parseFloat(form.liters),
        cost: parseFloat(form.cost),
        log_date: isoDate, // now always `string`, never `undefined`
      }
      await createFuelLog(payload)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log fuel. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-base-100 border border-base-300 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-300 px-6 py-4 bg-base-200/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/15 text-success">
              <GasPump size={20} weight="duotone" />
            </div>
            <div>
              <h3 className="font-semibold text-base-content">Log Fuel Fill-Up</h3>
              <p className="text-xs text-base-content/50">Record a fuel fill-up for a vehicle</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-base-content"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2.5 rounded-lg border border-error/30 bg-error/10 px-3.5 py-2.5 text-xs text-error font-medium">
              <WarningCircle size={18} weight="duotone" className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Vehicle */}
          <div>
            <label htmlFor="fuel_vehicle_id" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Vehicle <span className="text-error">*</span>
            </label>
            <select
              id="fuel_vehicle_id"
              name="vehicle_id"
              required
              value={form.vehicle_id}
              onChange={handleChange}
              className="select select-bordered w-full text-sm rounded-lg"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registration_number} — {v.name_model}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Liters */}
            <div>
              <label htmlFor="fuel_liters" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60">
                Liters <span className="text-error">*</span>
              </label>
              <input
                id="fuel_liters"
                name="liters"
                type="text"
                inputMode="decimal"
                required
                placeholder="0.00"
                value={form.liters}
                onChange={handleChange}
                className="input input-bordered w-full text-sm tabular-nums rounded-lg"
              />
            </div>

            {/* Cost */}
            <div>
              <label htmlFor="fuel_cost" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60">
                Total Cost (₹) <span className="text-error">*</span>
              </label>
              <input
                id="fuel_cost"
                name="cost"
                type="text"
                inputMode="decimal"
                required
                placeholder="0.00"
                value={form.cost}
                onChange={handleChange}
                className="input input-bordered w-full text-sm tabular-nums rounded-lg"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="fuel_log_date" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Fill-Up Date <span className="text-error">*</span>
            </label>
            <input
              id="fuel_log_date"
              name="log_date"
              type="date"
              required
              max={today()}
              value={form.log_date}
              onChange={handleChange}
              className="input input-bordered w-full text-sm rounded-lg"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-base-300">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn btn-ghost btn-sm rounded-full px-5 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-success btn-sm rounded-full px-6 font-semibold shadow-sm">
              {isSubmitting ? <span className="loading loading-spinner loading-xs" /> : 'Save Log'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// -------------------------------------------------
// Modal: Add General Expense
// -------------------------------------------------

interface AddExpenseModalProps {
  vehicles: Vehicle[]
  onClose: () => void
  onSuccess: () => void
}

interface ExpenseFormState {
  vehicle_id: number
  trip_id: null
  expense_type: string
  amount: string
}

function AddExpenseModal({ vehicles, onClose, onSuccess }: AddExpenseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ExpenseFormState>({
    vehicle_id: vehicles[0]?.id ?? 0,
    trip_id: null,
    expense_type: EXPENSE_TYPES[0],
    amount: '',
  })

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    if (name === 'amount' && value !== '' && !/^\d*\.?\d*$/.test(value)) return
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const payload: CreateExpensePayload = {
        vehicle_id: form.vehicle_id,
        trip_id: null,
        expense_type: form.expense_type,
        amount: parseFloat(form.amount),
      }
      await createExpense(payload)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record expense. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-base-100 border border-base-300 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-300 px-6 py-4 bg-base-200/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/15 text-warning">
              <Receipt size={20} weight="duotone" />
            </div>
            <div>
              <h3 className="font-semibold text-base-content">Log Expense</h3>
              <p className="text-xs text-base-content/50">Record an operational expense</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-base-content"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2.5 rounded-lg border border-error/30 bg-error/10 px-3.5 py-2.5 text-xs text-error font-medium">
              <WarningCircle size={18} weight="duotone" className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Vehicle */}
          <div>
            <label htmlFor="exp_vehicle_id" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Vehicle <span className="text-error">*</span>
            </label>
            <select
              id="exp_vehicle_id"
              name="vehicle_id"
              required
              value={form.vehicle_id}
              onChange={handleChange}
              className="select select-bordered w-full text-sm rounded-lg"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registration_number} — {v.name_model}
                </option>
              ))}
            </select>
          </div>

          {/* Expense Type */}
          <div>
            <label htmlFor="exp_expense_type" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Expense Type <span className="text-error">*</span>
            </label>
            <select
              id="exp_expense_type"
              name="expense_type"
              required
              value={form.expense_type}
              onChange={handleChange}
              className="select select-bordered w-full text-sm rounded-lg"
            >
              {EXPENSE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="exp_amount" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Amount (₹) <span className="text-error">*</span>
            </label>
            <input
              id="exp_amount"
              name="amount"
              type="text"
              inputMode="decimal"
              required
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange}
              className="input input-bordered w-full text-sm tabular-nums rounded-lg"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-base-300">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn btn-ghost btn-sm rounded-full px-5 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-warning btn-sm rounded-full px-6 font-semibold shadow-sm">
              {isSubmitting ? <span className="loading loading-spinner loading-xs" /> : 'Save Expense'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// -------------------------------------------------
// Sub-component: Fuel Logs Table
// -------------------------------------------------

interface FuelLogTableProps {
  logs: FuelLog[]
  isLoading: boolean
  searchQuery: string
}

function FuelLogTable({ logs, isLoading, searchQuery }: FuelLogTableProps) {
  const filtered = logs.filter((l) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      l.vehicles.registration_number.toLowerCase().includes(q) ||
      l.vehicles.name_model.toLowerCase().includes(q)
    )
  })

  return (
    <div className="card bg-base-200 border border-base-300 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-base-300 bg-base-300/30">
        <GasPump size={18} weight="duotone" className="text-success" />
        <h2 className="text-sm font-semibold text-base-content uppercase tracking-wider">Fuel Logs</h2>
        <span className="badge badge-sm badge-ghost ml-auto">{filtered.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr className="border-b border-base-300 text-xs uppercase tracking-wider text-base-content/40 bg-base-300/20">
              <th className="font-semibold py-3 pl-5">Vehicle</th>
              <th className="font-semibold py-3">Trip</th>
              <th className="font-semibold py-3">Date</th>
              <th className="font-semibold py-3">Liters</th>
              <th className="font-semibold py-3 pr-5">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-300/50">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="pl-5 py-4"><div className="skeleton h-4 w-32" /></td>
                  <td><div className="skeleton h-4 w-28" /></td>
                  <td><div className="skeleton h-4 w-24" /></td>
                  <td><div className="skeleton h-4 w-16" /></td>
                  <td className="pr-5"><div className="skeleton h-4 w-20" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-base-content/40 text-sm">
                  No fuel logs found.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="hover transition-colors">
                  <td className="pl-5">
                    <div className="flex items-center gap-2">
                      <Truck size={14} weight="duotone" className="text-base-content/40 shrink-0" />
                      <div>
                        <p className="font-mono text-xs font-semibold text-base-content">
                          {log.vehicles.registration_number}
                        </p>
                        <p className="text-xs text-base-content/50">{log.vehicles.name_model}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {log.trips ? (
                      <div className="flex items-center gap-1 text-xs text-base-content/70">
                        <span>{log.trips.source}</span>
                        <ArrowRight size={12} weight="bold" className="text-base-content/30" />
                        <span>{log.trips.destination}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-base-content/30">—</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-xs text-base-content/70">
                      <CalendarBlank size={13} weight="duotone" className="text-base-content/30" />
                      {fmtDate(log.log_date)}
                    </div>
                  </td>
                  <td className="tabular-nums text-sm text-base-content/80">
                    {log.liters != null ? `${Number(log.liters).toFixed(2)} L` : '—'}
                  </td>
                  <td className="pr-5 tabular-nums font-mono text-sm font-medium text-success">
                    {fmtINR(log.cost)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// -------------------------------------------------
// Sub-component: General Expenses Table
// -------------------------------------------------

interface ExpenseTableProps {
  expenses: Expense[]
  isLoading: boolean
  searchQuery: string
  typeFilter: string
}

const EXPENSE_TYPE_BADGE: Record<string, string> = {
  Maintenance: 'badge-warning',
  Toll: 'badge-info',
  'Driver Allowance': 'badge-accent',
  'Loading/Unloading': 'badge-secondary',
  Parking: 'badge-ghost',
  Insurance: 'badge-primary',
  Registration: 'badge-neutral',
  Other: 'badge-ghost',
}

function ExpenseTable({ expenses, isLoading, searchQuery, typeFilter }: ExpenseTableProps) {
  const filtered = expenses.filter((e) => {
    const matchType = typeFilter === 'All' || e.expense_type === typeFilter
    if (!searchQuery) return matchType
    const q = searchQuery.toLowerCase()
    return (
      matchType &&
      (e.vehicles.registration_number.toLowerCase().includes(q) ||
        e.vehicles.name_model.toLowerCase().includes(q) ||
        e.expense_type.toLowerCase().includes(q))
    )
  })

  return (
    <div className="card bg-base-200 border border-base-300 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-base-300 bg-base-300/30">
        <Receipt size={18} weight="duotone" className="text-warning" />
        <h2 className="text-sm font-semibold text-base-content uppercase tracking-wider">Other Expenses</h2>
        <span className="badge badge-sm badge-ghost ml-auto">{filtered.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr className="border-b border-base-300 text-xs uppercase tracking-wider text-base-content/40 bg-base-300/20">
              <th className="font-semibold py-3 pl-5">Vehicle</th>
              <th className="font-semibold py-3">Trip</th>
              <th className="font-semibold py-3">Type</th>
              <th className="font-semibold py-3">Date</th>
              <th className="font-semibold py-3 pr-5">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-300/50">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="pl-5 py-4"><div className="skeleton h-4 w-32" /></td>
                  <td><div className="skeleton h-4 w-28" /></td>
                  <td><div className="skeleton h-5 w-20 rounded-full" /></td>
                  <td><div className="skeleton h-4 w-24" /></td>
                  <td className="pr-5"><div className="skeleton h-4 w-20" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-base-content/40 text-sm">
                  No expenses found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((exp) => (
                <tr key={exp.id} className="hover transition-colors">
                  <td className="pl-5">
                    <div className="flex items-center gap-2">
                      <Truck size={14} weight="duotone" className="text-base-content/40 shrink-0" />
                      <div>
                        <p className="font-mono text-xs font-semibold text-base-content">
                          {exp.vehicles.registration_number}
                        </p>
                        <p className="text-xs text-base-content/50">{exp.vehicles.name_model}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {exp.trips ? (
                      <div className="flex items-center gap-1 text-xs text-base-content/70">
                        <span>{exp.trips.source}</span>
                        <ArrowRight size={12} weight="bold" className="text-base-content/30" />
                        <span>{exp.trips.destination}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-base-content/30">—</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge badge-sm font-medium px-2.5 py-2 rounded-md shadow-2xs ${EXPENSE_TYPE_BADGE[exp.expense_type] ?? 'badge-ghost'}`}
                    >
                      {exp.expense_type}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-xs text-base-content/70">
                      <CalendarBlank size={13} weight="duotone" className="text-base-content/30" />
                      {fmtDate(exp.created_at)}
                    </div>
                  </td>
                  <td className="pr-5 tabular-nums font-mono text-sm font-medium text-warning">
                    {fmtINR(exp.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// -------------------------------------------------
// KPI Summary Strip
// -------------------------------------------------

interface KpiStripProps {
  fuelLogs: FuelLog[]
  expenses: Expense[]
  isLoading: boolean
}

function KpiStrip({ fuelLogs, expenses, isLoading }: KpiStripProps) {
  const totalFuel = fuelLogs.reduce((s, l) => s + Number(l.cost ?? 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount ?? 0), 0)
  const totalOperational = totalFuel + totalExpenses
  const totalLiters = fuelLogs.reduce((s, l) => s + Number(l.liters ?? 0), 0)

  const kpis = [
    {
      label: 'Total Fuel Cost',
      value: fmtINR(totalFuel),
      icon: <GasPump size={20} weight="duotone" />,
      colorClass: 'text-success',
      bgClass: 'bg-success/10',
    },
    {
      label: 'Total Fuel Consumed',
      value: `${totalLiters.toFixed(1)} L`,
      icon: <GasPump size={20} weight="duotone" />,
      colorClass: 'text-info',
      bgClass: 'bg-info/10',
    },
    {
      label: 'Other Expenses',
      value: fmtINR(totalExpenses),
      icon: <Receipt size={20} weight="duotone" />,
      colorClass: 'text-warning',
      bgClass: 'bg-warning/10',
    },
    {
      label: 'Total Operational Cost',
      value: fmtINR(totalOperational),
      icon: <CurrencyInr size={20} weight="duotone" />,
      colorClass: 'text-primary',
      bgClass: 'bg-primary/10',
      valueStyle: { color: '#065f52', fontWeight: 800 },
      iconStyle: { backgroundColor: '#0883701a', color: '#088370' },
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="card bg-base-200 border border-base-300 shadow-sm p-4 flex flex-row items-center gap-3"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${kpi.iconStyle ? '' : `${kpi.bgClass} ${kpi.colorClass}`}`}
            style={kpi.iconStyle ?? {}}
          >
            {kpi.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-base-content/50 font-medium truncate">{kpi.label}</p>
            {isLoading ? (
              <div className="skeleton h-5 w-24 mt-1" />
            ) : (
              <p
                className={`text-base tabular-nums ${kpi.valueStyle ? '' : `font-bold ${kpi.colorClass}`}`}
                style={kpi.valueStyle ?? {}}
              >{kpi.value}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// -------------------------------------------------
// Main Page Component
// -------------------------------------------------

export function FuelExpenses() {
  // Data State
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [expenseTypeFilter, setExpenseTypeFilter] = useState('All')

  // Modals
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)

  // ---- Load data ----
  async function loadData() {
    setIsLoading(true)
    setApiError(null)
    try {
      const [logsData, expData, vehData] = await Promise.all([
        fetchFuelLogs(),
        fetchExpenses(),
        fetchVehicles(),
      ])
      setFuelLogs(logsData)
      setExpenses(expData)
      setVehicles(vehData)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to load data. Please try again.')
      // Clear stale data so tables show "no data" instead of old records
      setFuelLogs([])
      setExpenses([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-6">
      {/* ---- Page Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-base-content flex items-center gap-2.5">
            <GasPump size={26} weight="duotone" className="text-success" />
            Fuel &amp; Expenses
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Track fleet fuel fill-ups and operational expenditures
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="btn btn-ghost btn-sm text-base-content/60 self-start sm:self-auto"
          title="Refresh Data"
        >
          <ArrowsClockwise size={18} weight="duotone" />
        </button>
      </div>

      {/* ---- API Error Banner ---- */}
      {apiError && (
        <div className="flex items-center gap-3 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          <WarningCircle size={20} weight="duotone" className="shrink-0" />
          <span className="flex-1 font-medium">{apiError}</span>
          <button onClick={loadData} className="btn btn-ghost btn-xs text-error rounded-full">
            Retry
          </button>
        </div>
      )}

      {/* ---- KPI Strip ---- */}
      <KpiStrip fuelLogs={fuelLogs} expenses={expenses} isLoading={isLoading} />

      {/* ---- Action Bar ---- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-base-200/50 p-4 rounded-xl border border-base-300">
        {/* Left — Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-base-content/50 shrink-0">
            <Funnel size={16} weight="duotone" />
            Filters
          </div>

          {/* Expense type filter (affects Other Expenses table) */}
          <select
            value={expenseTypeFilter}
            onChange={(e) => setExpenseTypeFilter(e.target.value)}
            className="select select-bordered select-sm text-sm w-44 shrink-0 rounded-lg"
          >
            <option value="All">Type: All</option>
            {EXPENSE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Search */}
          <label className="input input-bordered input-sm flex items-center gap-2 w-60 shrink-0 rounded-lg">
            <MagnifyingGlass size={16} weight="duotone" className="text-base-content/40 shrink-0" />
            <input
              type="text"
              placeholder="Search vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="grow bg-transparent text-sm min-w-0"
            />
          </label>
        </div>

        {/* Right — Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="btn btn-warning btn-sm rounded-full px-4 font-semibold shadow-sm flex items-center gap-1.5"
          >
            <Plus size={16} weight="bold" />
            Log Expense
          </button>
          <button
            type="button"
            onClick={() => setIsFuelModalOpen(true)}
            className="btn btn-warning btn-sm rounded-full px-4 font-semibold shadow-sm flex items-center gap-1.5"
          >
            <Plus size={16} weight="bold" />
            Log Fuel
          </button>
        </div>
      </div>

      {/* ---- Tables ---- */}
      <div className="space-y-6">
        <FuelLogTable logs={fuelLogs} isLoading={isLoading} searchQuery={searchQuery} />
        <ExpenseTable
          expenses={expenses}
          isLoading={isLoading}
          searchQuery={searchQuery}
          typeFilter={expenseTypeFilter}
        />
      </div>

      {/* ---- Modals ---- */}
      <AnimatePresence>
        {isFuelModalOpen && vehicles.length > 0 && (
          <AddFuelModal
            vehicles={vehicles}
            onClose={() => setIsFuelModalOpen(false)}
            onSuccess={loadData}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpenseModalOpen && vehicles.length > 0 && (
          <AddExpenseModal
            vehicles={vehicles}
            onClose={() => setIsExpenseModalOpen(false)}
            onSuccess={loadData}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
