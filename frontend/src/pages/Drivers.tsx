import { useState, useMemo } from 'react'
import { Plus } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { useDrivers } from '../hooks/useDrivers'
import type { Driver } from '../types/models'

import { PageWrapper } from '../components/layout/PageWrapper'
import { SearchInput } from '../components/ui/SearchInput'
import { DriverTable } from '../components/features/DriverTable'
import { DriverStatusToggleBar } from '../components/features/DriverStatusToggleBar'
import { AddDriverModal } from '../components/features/AddDriverModal'

export function Drivers() {
  const { user } = useAuth()
  const isSafetyOfficer = user?.role === 'Safety Officer'

  const { drivers, loading, error, refetch } = useDrivers()
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)

  // Filter drivers by search query
  const filteredDrivers = useMemo(() => {
    const q = searchQuery.toLowerCase()
    if (!q) return drivers
    return drivers.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.license_number.toLowerCase().includes(q) ||
        d.contact_number.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q),
    )
  }, [drivers, searchQuery])

  function handleRowClick(driver: Driver) {
    setSelectedDriver((prev) => (prev?.id === driver.id ? null : driver))
  }

  function handleStatusUpdated() {
    refetch()
    // Keep selection so the user can toggle again if needed
  }

  return (
    <PageWrapper>
      {/* Page header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-base-content">Drivers &amp; Safety Profiles</h1>
          <p className="text-sm text-base-content/50">
            Manage driver records, licenses, and safety scores.
          </p>
        </div>

        {/* Search + Add Driver */}
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Search drivers..."
            onSearch={setSearchQuery}
          />
          {isSafetyOfficer && (
            <button
              type="button"
              className="btn btn-primary btn-sm shrink-0"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus size={20} weight="bold" />
              Add Driver
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error font-medium">
          {error}
        </div>
      )}

      {/* Data table */}
      <DriverTable
        drivers={filteredDrivers}
        loading={loading}
        selectedId={selectedDriver?.id ?? null}
        onRowClick={handleRowClick}
      />

      {/* Toggle status bar — Safety Officer only */}
      {isSafetyOfficer && (
        <DriverStatusToggleBar
          selectedDriverId={selectedDriver?.id ?? null}
          selectedDriverName={selectedDriver?.name ?? null}
          onStatusUpdated={handleStatusUpdated}
        />
      )}

      {/* Add Driver modal — Safety Officer only */}
      {isSafetyOfficer && (
        <AddDriverModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => {
            refetch()
            setAddModalOpen(false)
          }}
        />
      )}
    </PageWrapper>
  )
}
