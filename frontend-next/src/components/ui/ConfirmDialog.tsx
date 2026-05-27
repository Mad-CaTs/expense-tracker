'use client'

import { AnimatePresence, motion } from 'framer-motion'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Eliminar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onCancel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2"
          >
            <div className="rounded-[20px] border p-[1px]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
              <div className="rounded-[19px] p-6" style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}>
                <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                {description && (
                  <p className="mt-1.5 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{description}</p>
                )}
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={onCancel}
                    className="flex-1 h-10 rounded-full border text-[13px] font-semibold transition-colors"
                    style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
                  >
                    Cancelar
                  </button>
                  <motion.button
                    onClick={onConfirm}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="btn-danger-soft flex-1 h-10 rounded-full text-[13px] font-bold"
                  >
                    {confirmLabel}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
