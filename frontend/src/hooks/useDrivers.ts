import { useState, useCallback, useEffect } from 'react'
import type { Driver } from '../types/models'
import { getDrivers } from '../services/driverService'

interface UseDriversResult {
  drivers: Driver[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDrivers(): UseDriversResult {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDrivers = useCallback(() => {
    setLoading(true)
    setError(null)
    getDrivers()
      .then((data) => {
        setDrivers(data)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load drivers.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchDrivers()
  }, [fetchDrivers])

  return { drivers, loading, error, refetch: fetchDrivers }
}
