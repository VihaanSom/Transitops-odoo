import type { ButtonHTMLAttributes, ReactNode } from 'react'

type BtnVariant = 'primary' | 'error' | 'success' | 'info' | 'neutral' | 'ghost' | 'warning'
type BtnSize = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: BtnSize
  loading?: boolean
  children: ReactNode
}

const SIZE_CLASS: Record<BtnSize, string> = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
}

const VARIANT_CLASS: Record<BtnVariant, string> = {
  primary: 'btn-primary',
  error: 'btn-error',
  success: 'btn-success',
  info: 'btn-info',
  neutral: 'btn-neutral',
  ghost: 'btn-ghost',
  warning: 'btn-warning',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`btn ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="loading loading-spinner loading-xs" />}
      {children}
    </button>
  )
}
