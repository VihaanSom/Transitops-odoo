import { apiFetch } from './api'
import type { LoginPayload, LoginResponse } from '../types/api'

/**
 * POST /auth/login
 * Backend only requires { email, password } -- role is not part of the payload.
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
