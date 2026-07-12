interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const SIZE_CLASS = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <div className="avatar avatar-placeholder">
      <div
        className={`${SIZE_CLASS[size]} rounded-full bg-primary text-primary-content font-semibold`}
      >
        <span>{getInitials(name)}</span>
      </div>
    </div>
  )
}
