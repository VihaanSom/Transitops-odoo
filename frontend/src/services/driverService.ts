import type { Driver, DriverStatus } from '../types/models'
import type { CreateDriverPayload } from '../types/api'

// -------------------------------------------------
// Mock data — replace with apiFetch calls later
// -------------------------------------------------

let MOCK_DRIVERS: Driver[] = [
  {
    id: '1',
    name: 'Arjun Mehta',
    license_number: 'MH-1234567890',
    license_category: 'HMV',
    license_expiry_date: '2027-08-14',
    contact_number: '+91 98200 11111',
    safety_score: 92,
    status: 'available',
  },
  {
    id: '2',
    name: 'Priya Nair',
    license_number: 'KL-9876543210',
    license_category: 'LMV',
    license_expiry_date: '2025-01-10', // expired
    contact_number: '+91 94400 22222',
    safety_score: 76,
    status: 'suspended',
  },
  {
    id: '3',
    name: 'Rahul Singh',
    license_number: 'DL-5566778899',
    license_category: 'HMV',
    license_expiry_date: '2026-11-30',
    contact_number: '+91 99100 33333',
    safety_score: 88,
    status: 'on_trip',
  },
  {
    id: '4',
    name: 'Sneha Joshi',
    license_number: 'GJ-1122334455',
    license_category: 'LMV',
    license_expiry_date: '2024-06-01', // expired
    contact_number: '+91 90000 44444',
    safety_score: 61,
    status: 'off_duty',
  },
  {
    id: '5',
    name: 'Karan Verma',
    license_number: 'UP-6677889900',
    license_category: 'HMV',
    license_expiry_date: '2028-03-22',
    contact_number: '+91 87000 55555',
    safety_score: 95,
    status: 'available',
  },
  {
    id: '6',
    name: 'Deepa Iyer',
    license_number: 'TN-3344556677',
    license_category: 'LMV',
    license_expiry_date: '2026-07-19',
    contact_number: '+91 81200 66666',
    safety_score: 83,
    status: 'on_trip',
  },
]

// Simulate async latency
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getDrivers(): Promise<Driver[]> {
  await delay(400)
  return [...MOCK_DRIVERS]
}

export async function createDriver(payload: CreateDriverPayload): Promise<Driver> {
  await delay(500)
  // Simulate duplicate license validation
  if (MOCK_DRIVERS.some((d) => d.license_number === payload.license_number)) {
    throw new Error('A driver with this license number already exists.')
  }
  const newDriver: Driver = {
    id: String(Date.now()),
    ...payload,
    status: 'available',
  }
  MOCK_DRIVERS = [...MOCK_DRIVERS, newDriver]
  return newDriver
}

export async function updateDriverStatus(id: string, status: DriverStatus): Promise<Driver> {
  await delay(300)
  const idx = MOCK_DRIVERS.findIndex((d) => d.id === id)
  if (idx === -1) throw new Error('Driver not found.')
  MOCK_DRIVERS = MOCK_DRIVERS.map((d) => (d.id === id ? { ...d, status } : d))
  return MOCK_DRIVERS[idx]
}
