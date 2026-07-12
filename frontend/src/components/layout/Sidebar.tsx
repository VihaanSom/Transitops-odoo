import { NavLink, useLocation } from 'react-router'
import {
  TruckTrailer,
  Truck,
  UsersThree,
  Path,
  Wrench,
  CurrencyInr,
  ChartLine,
  GearSix,
  SquaresFour,
} from '@phosphor-icons/react'

// -------------------------------------------------
// Navigation items
// -------------------------------------------------

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: SquaresFour },
  { label: 'Fleet', path: '/fleet', icon: Truck },
  { label: 'Drivers', path: '/drivers', icon: UsersThree },
  { label: 'Trips', path: '/trips', icon: Path },
  { label: 'Maintenance', path: '/maintenance', icon: Wrench },
  { label: 'Fuel & Expenses', path: '/fuel-expenses', icon: CurrencyInr },
  { label: 'Analytics', path: '/analytics', icon: ChartLine },
]

const BOTTOM_NAV: NavItem[] = [
  { label: 'Settings', path: '/settings', icon: GearSix },
]

// -------------------------------------------------
// Component
// -------------------------------------------------

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-base-200 border-r border-base-300
          transition-transform duration-200 ease-out
          lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Branding */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-base-300">
          <TruckTrailer size={28} weight="duotone" style={{ color: '#088370' }} />
          <span className="text-lg font-semibold text-base-content">
            TransitOps
          </span>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                      ${
                        isActive
                          ? 'border-l-3'
                          : 'text-base-content/60 hover:bg-base-300 hover:text-base-content'
                      }
                    `}
                    style={isActive ? { backgroundColor: '#088370' + '1a', color: '#088370', borderColor: '#088370' } : {}}
                  >
                    <Icon size={20} weight="duotone" />
                    {item.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom navigation */}
        <div className="border-t border-base-300 px-3 py-3">
          <ul className="space-y-1">
            {BOTTOM_NAV.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                      ${
                        isActive
                          ? ''
                          : 'text-base-content/60 hover:bg-base-300 hover:text-base-content'
                      }
                    `}
                    style={isActive ? { backgroundColor: '#088370' + '1a', color: '#088370' } : {}}
                  >
                    <Icon size={20} weight="duotone" />
                    {item.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      </aside>
    </>
  )
}
