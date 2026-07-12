import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  MagnifyingGlass,
  SignOut,
  List,
  Moon,
  Sun,
} from '@phosphor-icons/react'
import { useAuth } from '../../context/AuthContext'

// -------------------------------------------------
// Component
// -------------------------------------------------

interface TopbarProps {
  onMenuToggle: () => void
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // ---- Theme toggle ----
  const [theme, setTheme] = useState<'cupcake' | 'night'>(() => {
    const saved = localStorage.getItem('transitops-theme')
    if (saved === 'cupcake' || saved === 'night') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'night'
      : 'cupcake'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('transitops-theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((prev) => (prev === 'cupcake' ? 'night' : 'cupcake'))
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  // Build display name from user object
  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
    : ''

  return (
    <header className="flex items-center gap-4 border-b border-base-300 bg-base-100 px-4 py-3 lg:px-6">
      {/* Mobile menu toggle */}
      <button
        className="btn btn-ghost btn-sm btn-square lg:hidden"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <List size={20} weight="bold" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-sm">
        <label className="input input-bordered input-sm flex items-center gap-2 w-full">
          <MagnifyingGlass size={16} weight="duotone" className="text-base-content/40" />
          <input
            type="text"
            placeholder="Search..."
            className="grow bg-transparent text-sm"
          />
        </label>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User info + Theme toggle + Logout */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-sm font-medium text-base-content">
          {displayName}
        </span>
        {user?.role && (
          <span className="badge badge-outline badge-sm font-medium">
            {user.role}
          </span>
        )}
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm btn-square text-base-content/70 hover:text-primary"
          aria-label="Toggle theme"
        >
          {theme === 'cupcake' ? (
            <Moon size={20} weight="duotone" />
          ) : (
            <Sun size={20} weight="duotone" />
          )}
        </button>
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm btn-square text-base-content/60 hover:text-error"
          aria-label="Sign out"
        >
          <SignOut size={20} weight="duotone" />
        </button>
      </div>
    </header>
  )
}
