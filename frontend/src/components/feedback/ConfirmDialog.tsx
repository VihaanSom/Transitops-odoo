import { AnimatePresence, motion } from 'motion/react'
import { WarningCircle } from '@phosphor-icons/react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="confirm-backdrop"
            className="fixed inset-0 z-[60] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            key="confirm-dialog"
            className="fixed left-1/2 top-1/2 z-[60] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-base-100 p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: '-48%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-48%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="flex flex-col gap-4">
              {/* Icon + Title */}
              <div className="flex items-center gap-3">
                <WarningCircle size={24} weight="duotone" className="text-error shrink-0" />
                <h3 className="text-base font-semibold text-base-content">{title}</h3>
              </div>

              {/* Description */}
              <p className="text-sm text-base-content/70">{description}</p>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  className="btn btn-error btn-sm"
                  onClick={onConfirm}
                  disabled={loading}
                >
                  {loading && <span className="loading loading-spinner loading-xs" />}
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
