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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2"
          >
            <div className="rounded-[20px] border border-[#1c1c1c] bg-[#0a0a0a] p-[1px]">
              <div
                className="rounded-[19px] bg-[#0e0e0e] p-6"
                style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)' }}
              >
                <p className="text-[15px] font-semibold text-[#e8e6db]">{title}</p>
                {description && (
                  <p className="mt-1.5 text-[13px] text-[#606060]">{description}</p>
                )}
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={onCancel}
                    className="flex-1 h-10 rounded-full border border-[#242424] text-[13px] font-semibold text-[#808080] transition-colors hover:border-[#383838] hover:text-[#e8e6db]"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    onClick={onConfirm}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="flex-1 h-10 rounded-full bg-[#ef4444]/10 text-[13px] font-bold text-[#ef4444] transition-colors hover:bg-[#ef4444]/20"
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
