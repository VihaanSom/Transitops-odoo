import type { ReactNode } from 'react'

type BadgeVariant = 'success' | 'error' | 'info' | 'neutral' | 'warning' | 'ghost'

interface BadgeProps {
  variant: BadgeVariant
  icon?: ReactNode
  children: ReactNode
  size?: 'sm' | 'md'
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  success: 'badge-success',
  error: 'badge-error',
  info: 'badge-info',
  neutral: 'badge-neutral',
  warning: 'badge-warning',
  ghost: 'badge-ghost',
}

export function Badge({ variant, icon, children, size = 'sm' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'badge-sm' : ''
  return (
    <span className={`badge ${VARIANT_CLASS[variant]} ${sizeClass} gap-1 font-medium`}>
      {icon}
      {children}
    </span>
  )
}
