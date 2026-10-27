'use client'

import type { ReactNode } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  /** Icono del círculo superior. Por defecto, la papelera: casi todas las
   *  confirmaciones son de eliminar. */
  icon?: ReactNode
  onConfirm: () => void
  onCancel: () => void
}

/** Solar `trash-bin-minimalistic` Bold. */
export function TrashIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g fill="currentColor">
        <path d="M3 6.52381C3 6.12932 3.32671 5.80952 3.72973 5.80952H8.51787C8.52437 4.9683 8.61554 3.81504 9.45037 3.01668C10.1074 2.38839 11.0081 2 12 2C12.9919 2 13.8926 2.38839 14.5496 3.01668C15.3844 3.81504 15.4756 4.9683 15.4821 5.80952H20.2703C20.6733 5.80952 21 6.12932 21 6.52381C21 6.9183 20.6733 7.2381 20.2703 7.2381H3.72973C3.32671 7.2381 3 6.9183 3 6.52381Z" />
        <path fillRule="evenodd" clipRule="evenodd" d="M11.5956 22H12.4044C15.1871 22 16.5785 22 17.4831 21.1141C18.3878 20.2281 18.4803 18.7749 18.6654 15.8685L18.9321 11.6806C19.0326 10.1036 19.0828 9.31511 18.6289 8.81545C18.1751 8.31579 17.4087 8.31579 15.876 8.31579H8.12404C6.59127 8.31579 5.82488 8.31579 5.37105 8.81545C4.91722 9.31511 4.96744 10.1036 5.06788 11.6806L5.33459 15.8685C5.5197 18.7749 5.61225 20.2281 6.51689 21.1141C7.42153 22 8.81289 22 11.5956 22ZM10.2463 12.1885C10.2051 11.7546 9.83753 11.4381 9.42537 11.4815C9.01321 11.5249 8.71251 11.9117 8.75372 12.3456L9.25372 17.6087C9.29494 18.0426 9.66247 18.3591 10.0746 18.3157C10.4868 18.2724 10.7875 17.8855 10.7463 17.4516L10.2463 12.1885ZM14.5746 11.4815C14.9868 11.5249 15.2875 11.9117 15.2463 12.3456L14.7463 17.6087C14.7051 18.0426 14.3375 18.3591 13.9254 18.3157C13.5132 18.2724 13.2125 17.8855 13.2537 17.4516L13.7537 12.1885C13.7949 11.7546 14.1625 11.4381 14.5746 11.4815Z" />
      </g>
    </svg>
  )
}

/**
 * Confirmación de una acción destructiva.
 *
 * Igual que `SuccessDialog` —centrada, icono en un círculo que entra con
 * resorte, botón blanco— para que confirmar y el aviso que le sigue se lean
 * como el mismo sistema. Sin rojo, a pedido del usuario: el título y el icono
 * ya dicen qué se va a hacer. Lo único distinto es el botón de Cancelar.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Eliminar',
  icon,
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
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)' }}
                >
                  {icon ?? <TrashIcon />}
                </motion.div>
                <p className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                {description && (
                  <p className="mt-1.5 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{description}</p>
                )}
                <div className="mt-6 flex w-full gap-2">
                  <motion.button
                    onClick={onCancel}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="h-10 flex-1 rounded-full text-[13px] font-semibold"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    onClick={onConfirm}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="h-10 flex-1 rounded-full text-[13px] font-bold"
                    style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
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
