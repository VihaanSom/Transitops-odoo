// -------------------------------------------------
// Driver Types
// -------------------------------------------------

export type DriverStatus = 'available' | 'on_trip' | 'off_duty' | 'suspended'

export interface Driver {
  id: string
  name: string
  license_number: string
  license_category: string
  license_expiry_date: string // ISO date string e.g. "2025-03-15"
  contact_number: string
  safety_score: number
  status: DriverStatus
}
