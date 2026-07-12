import type { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="flex flex-col gap-6 pb-10">
      {children}
    </div>
  )
}
