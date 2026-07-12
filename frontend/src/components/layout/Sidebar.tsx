import { NavLink, useLocation } from 'react-router'
import {
  SquaresFour,
  ChartBar,
  Truck,
  UsersThree,
  Path,
  Wrench,
  CurrencyDollar,
  ChartLine,
  GearSix,
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
  { label: 'Fuel & Expenses', path: '/fuel-expenses', icon: CurrencyDollar },
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
          <ChartBar size={28} weight="duotone" className="text-primary" />
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
                          ? 'bg-primary/10 text-primary border-l-3 border-primary'
                          : 'text-base-content/60 hover:bg-base-300 hover:text-base-content'
                      }
                    `}
                  >
                    <Icon size={20} weight={isActive ? 'duotone' : 'duotone'} />
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
                          ? 'bg-primary/10 text-primary'
                          : 'text-base-content/60 hover:bg-base-300 hover:text-base-content'
                      }
                    `}
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
