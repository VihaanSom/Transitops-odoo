import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, id, ...rest }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-base-content">
        {label}
        {rest.required && <span className="text-error ml-1">*</span>}
      </label>
      <input
        id={inputId}
        className={`input input-bordered input-sm w-full ${error ? 'input-error' : ''}`}
        {...rest}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
