import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle, XCircle, Info } from '@phosphor-icons/react'

// -------------------------------------------------
// Toast types
// -------------------------------------------------

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void
}

// -------------------------------------------------
// Context
// -------------------------------------------------

const ToastContext = createContext<ToastContextValue | null>(null)

// -------------------------------------------------
// Provider
// -------------------------------------------------

interface ToastProviderProps {
  children: ReactNode
}

const VARIANT_ICONS: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle size={18} weight="duotone" className="text-success" />,
  error: <XCircle size={18} weight="duotone" className="text-error" />,
  info: <Info size={18} weight="duotone" className="text-info" />,
}

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: 'border-success/30',
  error: 'border-error/30',
  info: 'border-info/30',
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = String(Date.now())
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border bg-base-100 px-4 py-3 shadow-lg text-sm font-medium text-base-content ${VARIANT_CLASSES[toast.variant]}`}
            >
              {VARIANT_ICONS[toast.variant]}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// -------------------------------------------------
// Hook
// -------------------------------------------------

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
