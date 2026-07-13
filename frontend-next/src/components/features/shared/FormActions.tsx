'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

interface FormActionsProps {
  embedded: boolean
  isEdit: boolean
  isSubmitting: boolean
  onSubmit: () => void
  onRequestDelete?: () => void
}

export function FormActions({ embedded, isEdit, isSubmitting, onSubmit, onRequestDelete }: FormActionsProps) {
  return (
    <div
      className={embedded ? 'px-4 pt-3 pb-4' : 'fixed bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-3'}
      style={embedded ? undefined : { background: 'var(--bg-base)' }}
    >
      <motion.button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-bold uppercase tracking-[0.06em] disabled:opacity-50"
        style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
      >
        {!isSubmitting && <CheckCircle size={18} strokeWidth={1.7} />}
        {isSubmitting ? '...' : isEdit ? 'Actualizar registro' : 'Guardar registro'}
      </motion.button>
      {embedded && onRequestDelete && (
        <button
          type="button"
          onClick={onRequestDelete}
          className="mt-2 flex h-10 w-full items-center justify-center rounded-full text-[13px] font-semibold transition-colors cursor-pointer"
          style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)' }}
        >
          Eliminar registro
        </button>
      )}
    </div>
  )
}
