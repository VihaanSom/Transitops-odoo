const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('transitops-token')

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const error: { message?: string; error?: string } = await res.json().catch(() => ({}))
    throw new Error(error.error || error.message || `API error: ${res.status}`)
  }

  return res.json() as Promise<T>
}
