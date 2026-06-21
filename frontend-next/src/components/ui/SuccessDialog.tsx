'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface SuccessDialogProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
}

export function SuccessDialog({ open, title, description, onClose }: SuccessDialogProps) {
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
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2"
          >
            <div className="rounded-[20px] border p-[1px]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
              <div className="flex flex-col items-center rounded-[19px] px-6 py-8 text-center" style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.08, type: 'spring', stiffness: 400, damping: 22 }}
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: 'var(--accent-bg)' }}
                >
                  <Check size={22} strokeWidth={2.5} style={{ color: 'var(--accent-light)' }} />
                </motion.div>
                <p className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                {description && (
                  <p className="mt-1.5 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{description}</p>
                )}
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="mt-6 h-10 w-full rounded-full text-[13px] font-bold"
                  style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
                >
                  Listo
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
