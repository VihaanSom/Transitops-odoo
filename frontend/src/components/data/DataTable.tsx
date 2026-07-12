import type { ReactNode } from 'react'

// -------------------------------------------------
// Generic column definition
// -------------------------------------------------

export interface ColumnDef<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

// -------------------------------------------------
// Component props
// -------------------------------------------------

interface DataTableProps<T extends { id: string }> {
  columns: ColumnDef<T>[]
  data: T[]
  selectedId?: string | null
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyMessage?: string
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  selectedId,
  onRowClick,
  loading = false,
  emptyMessage = 'No records found.',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-base-300">
      <table className="table table-sm w-full">
        {/* Head */}
        <thead className="bg-base-200 text-base-content/70 text-xs uppercase tracking-wide">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12">
                <span className="loading loading-spinner loading-md text-primary" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-base-content/40 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={`
                  cursor-pointer transition-colors
                  ${selectedId === row.id ? 'bg-base-200' : 'hover:bg-base-200/50'}
                `}
              >
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
