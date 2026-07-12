import { apiFetch } from './api'

// -------------------------------------------------
// Types
// -------------------------------------------------

export interface UserProfile {
  id: number
  email: string
  role: string
  first_name: string | null
  last_name: string | null
}

// -------------------------------------------------
// Service Methods
// -------------------------------------------------

/**
 * GET /auth/me
 * Fetches the currently authenticated user's profile.
 */
export async function fetchProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/auth/me')
}

/**
 * PUT /auth/me
 * Updates the currently authenticated user's profile (first_name, last_name).
 */
export async function updateProfile(data: {
  first_name?: string
  last_name?: string
}): Promise<UserProfile> {
  return apiFetch<UserProfile>('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
