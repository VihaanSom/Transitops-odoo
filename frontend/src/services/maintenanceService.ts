import { apiFetch } from './api'
import type { MaintenanceRecord, CreateMaintenancePayload, CloseMaintenancePayload } from '../types/api'

// -------------------------------------------------
// API Service Methods
// -------------------------------------------------

/**
 * GET /maintenance
 * Returns list of maintenance records.
 */
export async function fetchMaintenanceRecords(): Promise<MaintenanceRecord[]> {
  return await apiFetch<MaintenanceRecord[]>('/maintenance')
}

/**
 * POST /maintenance
 * Creates a new maintenance record in 'open' status.
 */
export async function createMaintenanceRecord(payload: CreateMaintenancePayload): Promise<MaintenanceRecord> {
  return await apiFetch<MaintenanceRecord>('/maintenance', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * PATCH /maintenance/:id/close
 * Closes an open maintenance ticket.
 */
export async function closeMaintenanceRecord(id: string, payload: CloseMaintenancePayload): Promise<MaintenanceRecord> {
  return await apiFetch<MaintenanceRecord>(`/maintenance/${id}/close`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
