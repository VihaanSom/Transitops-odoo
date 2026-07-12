import { apiFetch } from './api'
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from '../types/api'

/**
 * POST /auth/login
 * Payload: { email, password }
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * POST /auth/register
 * Payload: { email, password, role }
 */
export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
