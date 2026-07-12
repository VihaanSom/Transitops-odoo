import { useState, useEffect, useCallback } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'

interface SearchInputProps {
  placeholder?: string
  onSearch: (value: string) => void
  debounceMs?: number
}

export function SearchInput({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
}: SearchInputProps) {
  const [value, setValue] = useState('')

  const debouncedSearch = useCallback(
    (v: string) => {
      const timer = setTimeout(() => onSearch(v), debounceMs)
      return () => clearTimeout(timer)
    },
    [onSearch, debounceMs],
  )

  useEffect(() => {
    const cancel = debouncedSearch(value)
    return cancel
  }, [value, debouncedSearch])

  return (
    <label className="input input-bordered input-sm flex items-center gap-2 w-full max-w-xs">
      <MagnifyingGlass size={16} weight="duotone" className="text-base-content/40 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="grow bg-transparent text-sm"
      />
    </label>
  )
}
