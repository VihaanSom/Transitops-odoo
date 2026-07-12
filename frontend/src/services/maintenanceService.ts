import { apiFetch } from './api'
import type { MaintenanceRecord, CreateMaintenancePayload, CloseMaintenancePayload } from '../types/api'

// -------------------------------------------------
// Mock Data & Helper Functions for Offline/Local Mode
// -------------------------------------------------

let MOCK_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: '101',
    vehicle_id: '1',
    description: 'Oil Change',
    cost: 2500,
    status: 'open',
    created_at: '2026-07-07T10:00:00Z',
    vehicle: { id: '1', registration_number: 'GJ01AB4521', name_model: 'VAN-05', vehicle_type: 'Van' },
  },
  {
    id: '102',
    vehicle_id: '2',
    description: 'Engine Repair',
    cost: 18000,
    status: 'closed',
    created_at: '2026-06-15T14:30:00Z',
    closed_at: '2026-06-20T17:00:00Z',
    vehicle: { id: '2', registration_number: 'GJ01AB9981', name_model: 'TRUCK-11', vehicle_type: 'Truck' },
  },
  {
    id: '103',
    vehicle_id: '3',
    description: 'Tyre Replace',
    cost: 6200,
    status: 'open',
    created_at: '2026-07-10T09:15:00Z',
    vehicle: { id: '3', registration_number: 'GJ01AB1120', name_model: 'MINI-03', vehicle_type: 'Mini' },
  },
]

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// -------------------------------------------------
// API Service Methods
// -------------------------------------------------

/**
 * GET /maintenance
 * Returns list of maintenance records.
 */
export async function fetchMaintenanceRecords(): Promise<MaintenanceRecord[]> {
  try {
    return await apiFetch<MaintenanceRecord[]>('/maintenance')
  } catch (error) {
    console.warn('Backend unavailable or failed for GET /maintenance. Using mock fallback.', error)
    await delay(350)
    return [...MOCK_MAINTENANCE]
  }
}

/**
 * POST /maintenance
 * Creates a new maintenance record in 'open' status.
 */
export async function createMaintenanceRecord(payload: CreateMaintenancePayload): Promise<MaintenanceRecord> {
  try {
    return await apiFetch<MaintenanceRecord>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.warn('Backend unavailable or failed for POST /maintenance. Using mock fallback.', error)
    await delay(400)
    const newRecord: MaintenanceRecord = {
      id: String(Date.now()),
      vehicle_id: payload.vehicle_id,
      description: payload.description,
      cost: payload.cost || 0,
      status: 'open',
      created_at: new Date().toISOString(),
      vehicle: {
        id: payload.vehicle_id,
        registration_number: `REG-${payload.vehicle_id.slice(-4)}`,
        name_model: `VEH-${payload.vehicle_id}`,
      },
    }
    MOCK_MAINTENANCE = [newRecord, ...MOCK_MAINTENANCE]
    return newRecord
  }
}

/**
 * PATCH /maintenance/:id/close
 * Closes an open maintenance ticket.
 */
export async function closeMaintenanceRecord(id: string, payload: CloseMaintenancePayload): Promise<MaintenanceRecord> {
  try {
    return await apiFetch<MaintenanceRecord>(`/maintenance/${id}/close`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.warn(`Backend unavailable or failed for PATCH /maintenance/${id}/close. Using mock fallback.`, error)
    await delay(350)
    const existing = MOCK_MAINTENANCE.find((m) => m.id === id)
    if (!existing) {
      throw new Error('Maintenance record not found.')
    }
    const updated: MaintenanceRecord = {
      ...existing,
      status: 'closed',
      cost: payload.cost ?? existing.cost ?? 0,
      closed_at: payload.closed_at || new Date().toISOString(),
    }
    MOCK_MAINTENANCE = MOCK_MAINTENANCE.map((m) => (m.id === id ? updated : m))
    return updated
  }
}
