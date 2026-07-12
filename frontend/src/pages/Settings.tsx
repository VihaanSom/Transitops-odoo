import { useState, useEffect, type FormEvent } from 'react'
import {
  GearSix,
  ShieldCheck,
  Check,
  Eye,
  Minus,
  FloppyDisk,
  Building,
  CurrencyInr,
  Path,
  UserCircle,
  WarningCircle,
} from '@phosphor-icons/react'
import { useToast } from '../components/feedback/Toast'
import { fetchProfile, updateProfile } from '../services/profileService'
import type { UserProfile } from '../services/profileService'

// -------------------------------------------------
// Types & Defaults
// -------------------------------------------------
interface GeneralSettingsState {
  depotName: string
  currency: string
  distanceUnit: string
}

const DEFAULT_SETTINGS: GeneralSettingsState = {
  depotName: 'Gandhinagar Depot GJ4',
  currency: 'INR (Rs)',
  distanceUnit: 'Kilometers',
}

const SETTINGS_STORAGE_KEY = 'transitops_general_settings'

// -------------------------------------------------
// RBAC Data Definitions
// -------------------------------------------------
type AccessType = 'full' | 'view' | 'none'

interface RbacRow {
  role: string
  fleet: AccessType
  drivers: AccessType
  trips: AccessType
  fuelExpenses: AccessType
  analytics: AccessType
}

const RBAC_MATRIX: RbacRow[] = [
  {
    role: 'Fleet Manager',
    fleet: 'full',
    drivers: 'full',
    trips: 'none',
    fuelExpenses: 'none',
    analytics: 'full',
  },
  {
    role: 'Dispatcher',
    fleet: 'view',
    drivers: 'none',
    trips: 'full',
    fuelExpenses: 'none',
    analytics: 'none',
  },
  {
    role: 'Safety Officer',
    fleet: 'none',
    drivers: 'full',
    trips: 'view',
    fuelExpenses: 'none',
    analytics: 'none',
  },
  {
    role: 'Financial Analyst',
    fleet: 'view',
    drivers: 'none',
    trips: 'none',
    fuelExpenses: 'full',
    analytics: 'full',
  },
]

// -------------------------------------------------
// Helper Component for RBAC Matrix Icons
// -------------------------------------------------
function AccessIndicator({ type }: { type: AccessType }) {
  if (type === 'full') {
    return (
      <div className="inline-flex items-center justify-center p-1.5 rounded-lg bg-[#088370]/15 text-[#088370] shadow-2xs" title="Full Access">
        <Check size={16} weight="bold" />
      </div>
    )
  }
  if (type === 'view') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-info/15 text-info font-medium text-xs shadow-2xs" title="View Only Access">
        <Eye size={14} weight="duotone" />
        <span>View</span>
      </div>
    )
  }
  return (
    <div className="inline-flex items-center justify-center p-1.5 text-base-content/25" title="No Access">
      <Minus size={16} weight="bold" />
    </div>
  )
}

// -------------------------------------------------
// Main Settings & RBAC Page Component
// -------------------------------------------------
export function Settings() {
  const { showToast } = useToast()

  // ---- General Settings (localStorage) ----
  const [settings, setSettings] = useState<GeneralSettingsState>(DEFAULT_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)

  // ---- Profile State (API-backed) ----
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Load persisted local settings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<GeneralSettingsState>
        setSettings({
          depotName: parsed.depotName || DEFAULT_SETTINGS.depotName,
          currency: parsed.currency || DEFAULT_SETTINGS.currency,
          distanceUnit: parsed.distanceUnit || DEFAULT_SETTINGS.distanceUnit,
        })
      }
    } catch (err) {
      console.warn('Failed to parse saved settings from localStorage, using defaults.', err)
    }
  }, [])

  // Load profile from API on mount
  useEffect(() => {
    async function loadProfile() {
      setIsLoadingProfile(true)
      setProfileError(null)
      try {
        const data = await fetchProfile()
        setProfile(data)
        setFirstName(data.first_name || '')
        setLastName(data.last_name || '')
      } catch (err) {
        setProfileError(err instanceof Error ? err.message : 'Failed to load profile.')
      } finally {
        setIsLoadingProfile(false)
      }
    }
    void loadProfile()
  }, [])

  const handleSaveSettings = (e: FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
      showToast('Settings saved successfully!', 'success')
    } catch (err) {
      console.error('Failed to save settings to localStorage:', err)
      showToast('Could not save settings.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    setProfileError(null)
    try {
      const updated = await updateProfile({
        first_name: firstName,
        last_name: lastName,
      })
      setProfile(updated)
      setFirstName(updated.first_name || '')
      setLastName(updated.last_name || '')
      showToast('Profile updated successfully!', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.'
      setProfileError(msg)
      showToast(msg, 'error')
    } finally {
      setIsSavingProfile(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-base-300 pb-4">
        <h1 className="text-2xl font-semibold text-base-content tracking-tight">
          Settings &amp; Access Control
        </h1>
        <p className="text-xs text-base-content/60 font-medium mt-0.5">
          Configure general system parameters and inspect role-based permission matrices
        </p>
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Profile + General Settings (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* ---- PROFILE SECTION (API-backed) ---- */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5">
              <div className="flex items-center gap-2 border-b border-base-300/60 pb-3.5 mb-4">
                <div className="p-1.5 rounded-lg bg-info/10 text-info">
                  <UserCircle size={18} weight="duotone" />
                </div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-base-content/70">
                  PROFILE
                </h2>
                {profile && (
                  <span className="ml-auto badge badge-ghost badge-sm font-mono text-[10px]">
                    {profile.role}
                  </span>
                )}
              </div>

              {isLoadingProfile ? (
                <div className="flex items-center justify-center py-8">
                  <span className="loading loading-spinner loading-sm text-info" />
                </div>
              ) : profileError && !profile ? (
                <div className="flex items-center gap-2.5 rounded-lg border border-error/30 bg-error/10 px-3.5 py-2.5 text-xs text-error font-medium">
                  <WarningCircle size={16} weight="duotone" className="shrink-0" />
                  <span>{profileError}</span>
                </div>
              ) : (
                <form onSubmit={(e) => void handleSaveProfile(e)} className="space-y-4">
                  {/* Email (read-only) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-base-content/80">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="input input-bordered w-full text-sm font-medium bg-base-200/50 text-base-content/60 cursor-not-allowed"
                    />
                  </div>

                  {/* First Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-base-content/80">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Raven"
                      className="input input-bordered w-full text-sm font-medium bg-base-100 focus:border-info"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-base-content/80">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Kumar"
                      className="input input-bordered w-full text-sm font-medium bg-base-100 focus:border-info"
                    />
                  </div>

                  {/* Profile Error Inline */}
                  {profileError && (
                    <div className="flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs text-error font-medium">
                      <WarningCircle size={14} weight="duotone" className="shrink-0" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="btn btn-info rounded-full px-6 gap-2 font-semibold shadow-sm"
                    >
                      <FloppyDisk size={18} weight="bold" />
                      {isSavingProfile ? 'Saving...' : 'Update profile'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ---- GENERAL SETTINGS SECTION (localStorage) ---- */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5">
              <div className="flex items-center gap-2 border-b border-base-300/60 pb-3.5 mb-4">
                <div className="p-1.5 rounded-lg bg-[#088370]/10 text-[#088370]">
                  <GearSix size={18} weight="duotone" />
                </div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-base-content/70">
                  GENERAL
                </h2>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                {/* Depot Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-base-content/80 flex items-center gap-1.5">
                    <Building size={14} weight="duotone" className="text-[#088370]" />
                    Depot Name
                  </label>
                  <input
                    type="text"
                    value={settings.depotName}
                    onChange={(e) => setSettings({ ...settings, depotName: e.target.value })}
                    placeholder="e.g. Gandhinagar Depot GJ4"
                    required
                    className="input input-bordered w-full text-sm font-medium bg-base-100 focus:border-primary"
                  />
                </div>

                {/* Currency Input/Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-base-content/80 flex items-center gap-1.5">
                    <CurrencyInr size={14} weight="duotone" className="text-[#088370]" />
                    Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="select select-bordered w-full text-sm font-medium bg-base-100 focus:border-primary"
                  >
                    <option value="INR (Rs)">INR (&#8377;)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                  </select>
                </div>

                {/* Distance Unit Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-base-content/80 flex items-center gap-1.5">
                    <Path size={14} weight="duotone" className="text-[#088370]" />
                    Distance Unit
                  </label>
                  <select
                    value={settings.distanceUnit}
                    onChange={(e) => setSettings({ ...settings, distanceUnit: e.target.value })}
                    className="select select-bordered w-full text-sm font-medium bg-base-100 focus:border-primary"
                  >
                    <option value="Kilometers">Kilometers (km)</option>
                    <option value="Miles">Miles (mi)</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn border-none text-white bg-[#088370] hover:bg-[#088370]/90 rounded-full px-6 gap-2 font-semibold shadow-sm"
                  >
                    <FloppyDisk size={18} weight="bold" />
                    {isSaving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: RBAC Matrix Table (lg:col-span-7) */}
        <div className="lg:col-span-7">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5">
              <div className="flex items-center gap-2 border-b border-base-300/60 pb-3.5 mb-4">
                <div className="p-1.5 rounded-lg bg-[#088370]/10 text-[#088370]">
                  <ShieldCheck size={18} weight="duotone" />
                </div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-base-content/70">
                  ROLE-BASED ACCESS (RBAC)
                </h2>
              </div>

              {/* Data-Dense Static Access Matrix Table */}
              <div className="overflow-x-auto">
                <table className="table w-full text-sm">
                  <thead>
                    <tr className="border-b border-base-300 text-[11px] uppercase tracking-wider font-semibold text-base-content/60">
                      <th className="py-3 pl-3">Role</th>
                      <th className="py-3 text-center">Fleet</th>
                      <th className="py-3 text-center">Drivers</th>
                      <th className="py-3 text-center">Trips</th>
                      <th className="py-3 text-center">Fuel/Exp.</th>
                      <th className="py-3 text-center pr-3">Analytics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-200">
                    {RBAC_MATRIX.map((row) => (
                      <tr key={row.role} className="hover:bg-base-200/40 transition-colors">
                        <td className="py-3.5 pl-3 font-semibold text-base-content text-sm whitespace-nowrap">
                          {row.role}
                        </td>
                        <td className="py-3.5 text-center">
                          <AccessIndicator type={row.fleet} />
                        </td>
                        <td className="py-3.5 text-center">
                          <AccessIndicator type={row.drivers} />
                        </td>
                        <td className="py-3.5 text-center">
                          <AccessIndicator type={row.trips} />
                        </td>
                        <td className="py-3.5 text-center">
                          <AccessIndicator type={row.fuelExpenses} />
                        </td>
                        <td className="py-3.5 text-center pr-3">
                          <AccessIndicator type={row.analytics} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend & Note */}
              <div className="mt-4 pt-3 border-t border-base-200 flex flex-wrap items-center justify-between gap-3 text-xs text-base-content/60">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="p-1 rounded bg-[#088370]/15 text-[#088370]">
                      <Check size={12} weight="bold" />
                    </span>
                    <span>Full Access</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="px-1.5 py-0.5 rounded-full bg-info/15 text-info text-[10px]">
                      <Eye size={12} weight="duotone" className="inline mr-0.5" />
                      View
                    </span>
                    <span>Read Only</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="p-1 text-base-content/25">
                      <Minus size={12} weight="bold" />
                    </span>
                    <span>No Access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
