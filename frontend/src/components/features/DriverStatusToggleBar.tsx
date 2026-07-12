import { useState } from 'react'
import type { DriverStatus } from '../../types/models'
import { ConfirmDialog } from '../feedback/ConfirmDialog'
import { updateDriverStatus } from '../../services/driverService'
import { useToast } from '../feedback/Toast'

// -------------------------------------------------
// Status button definitions
// -------------------------------------------------

interface StatusOption {
  status: DriverStatus
  label: string
  btnClass: string
}

const STATUS_OPTIONS: StatusOption[] = [
  { status: 'available', label: 'Available', btnClass: 'btn-success' },
  { status: 'on_trip', label: 'On Trip', btnClass: 'btn-info' },
  { status: 'off_duty', label: 'Off Duty', btnClass: 'btn-neutral' },
  { status: 'suspended', label: 'Suspended', btnClass: 'btn-error' },
]

// -------------------------------------------------
// Component
// -------------------------------------------------

interface DriverStatusToggleBarProps {
  selectedDriverId: string | null
  selectedDriverName: string | null
  onStatusUpdated: () => void
}

export function DriverStatusToggleBar({
  selectedDriverId,
  selectedDriverName,
  onStatusUpdated,
}: DriverStatusToggleBarProps) {
  const { showToast } = useToast()
  const [pendingStatus, setPendingStatus] = useState<DriverStatus | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const hasSelection = !!selectedDriverId

  async function applyStatus(status: DriverStatus) {
    if (!selectedDriverId) return
    setLoading(true)
    try {
      await updateDriverStatus(selectedDriverId, status)
      showToast(`Status updated to "${status.replace('_', ' ')}" successfully.`, 'success')
      onStatusUpdated()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.'
      showToast(msg, 'error')
    } finally {
      setLoading(false)
      setConfirmOpen(false)
      setPendingStatus(null)
    }
  }

  function handleClick(option: StatusOption) {
    if (!hasSelection) return
    if (option.status === 'suspended') {
      setPendingStatus('suspended')
      setConfirmOpen(true)
    } else {
      void applyStatus(option.status)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-base-300 bg-base-100 px-4 py-3">
        <span className="text-sm font-medium text-base-content/70 shrink-0">Toggle Status</span>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.status}
              type="button"
              className={`btn btn-sm ${opt.btnClass} ${!hasSelection ? 'btn-disabled opacity-40' : ''}`}
              disabled={!hasSelection || loading}
              onClick={() => handleClick(opt)}
            >
              {loading && pendingStatus === opt.status && (
                <span className="loading loading-spinner loading-xs" />
              )}
              {opt.label}
            </button>
          ))}
        </div>
        {!hasSelection && (
          <span className="text-xs text-base-content/40 ml-auto">Select a row to toggle status</span>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Suspend Driver?"
        description={`Are you sure you want to suspend ${selectedDriverName ?? 'this driver'}? Suspended drivers are blocked from trip assignment.`}
        confirmLabel="Suspend"
        cancelLabel="Cancel"
        onConfirm={() => void applyStatus('suspended')}
        onCancel={() => {
          setConfirmOpen(false)
          setPendingStatus(null)
        }}
        loading={loading}
      />
    </>
  )
}
