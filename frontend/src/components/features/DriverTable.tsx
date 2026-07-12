import { Circle, WarningCircle } from '@phosphor-icons/react'
import type { Driver, DriverStatus } from '../../types/models'
import { DataTable, type ColumnDef } from '../data/DataTable'
import { Badge } from '../ui/Badge'

// -------------------------------------------------
// Status → badge variant mapping
// -------------------------------------------------

type BadgeVariant = 'success' | 'error' | 'info' | 'neutral'

const STATUS_BADGE: Record<DriverStatus, { variant: BadgeVariant; label: string }> = {
  available: { variant: 'success', label: 'Available' },
  on_trip: { variant: 'info', label: 'On Trip' },
  off_duty: { variant: 'neutral', label: 'Off Duty' },
  suspended: { variant: 'error', label: 'Suspended' },
}

// -------------------------------------------------
// Helpers
// -------------------------------------------------

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
// Column definitions
// -------------------------------------------------

const COLUMNS: ColumnDef<Driver>[] = [
  {
    key: 'name',
    header: 'Driver',
    render: (row) => (
      <span className="text-sm font-medium text-base-content">{row.name}</span>
    ),
  },
  {
    key: 'license_number',
    header: 'License No.',
    render: (row) => (
      <span className="font-mono text-xs text-base-content/80">{row.license_number}</span>
    ),
  },
  {
    key: 'license_category',
    header: 'Category',
    render: (row) => (
      <span className="badge badge-ghost badge-sm font-medium">{row.license_category}</span>
    ),
  },
  {
    key: 'license_expiry_date',
    header: 'Expiry',
    render: (row) => {
      const expired = isExpired(row.license_expiry_date)
      return (
        <span className={`flex items-center gap-1 text-sm ${expired ? 'text-error font-medium' : 'text-base-content'}`}>
          {expired && <WarningCircle size={14} weight="bold" className="shrink-0" />}
          {formatDate(row.license_expiry_date)}
          {expired && <span className="text-xs font-semibold">EXPIRED</span>}
        </span>
      )
    },
  },
  {
    key: 'contact_number',
    header: 'Contact',
    render: (row) => (
      <span className="text-sm text-base-content/80">{row.contact_number}</span>
    ),
  },
  {
    key: 'trip_completion',
    header: 'Trip Compl.',
    render: () => (
      <span className="text-base-content/40 text-sm">—</span>
    ),
  },
  {
    key: 'safety_score',
    header: 'Safety',
    render: (row) => (
      <span className="badge badge-ghost badge-sm font-medium">{row.safety_score}%</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => {
      const { variant, label } = STATUS_BADGE[row.status]
      return (
        <Badge
          variant={variant}
          icon={<Circle size={8} weight="fill" />}
        >
          {label}
        </Badge>
      )
    },
  },
]

// -------------------------------------------------
// Component
// -------------------------------------------------

interface DriverTableProps {
  drivers: Driver[]
  loading: boolean
  selectedId: string | null
  onRowClick: (driver: Driver) => void
}

export function DriverTable({ drivers, loading, selectedId, onRowClick }: DriverTableProps) {
  return (
    <DataTable
      columns={COLUMNS}
      data={drivers}
      selectedId={selectedId}
      onRowClick={onRowClick}
      loading={loading}
      emptyMessage="No drivers found."
    />
  )
}
