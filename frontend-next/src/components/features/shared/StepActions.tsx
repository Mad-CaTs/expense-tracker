'use client'

import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'

const SPRING = { type: 'spring', stiffness: 500, damping: 30 } as const

export interface StepActionsProps {
  nextLabel: string
  onNext: () => void
  /** Vuelve al paso anterior. Sin esto, la izquierda muestra Cancelar. */
  onBack?: () => void
  onCancel?: () => void
  onDelete?: () => void
  pending?: boolean
}

/**
 * Botonera de un sheet por pasos: acción secundaria a la izquierda (Atrás o
 * Cancelar) y la principal a la derecha.
 *
 * El hundido va por `whileTap` con spring y no por `active:scale` de CSS: el
 * rebote al soltar es lo que hace que se sienta suave, y es el patrón que ya
 * usan los formularios de categorías y frecuentes.
 */
export function StepActions({ nextLabel, onNext, onBack, onCancel, onDelete, pending }: StepActionsProps) {
  const secondary = onBack ?? onCancel
  return (
    <div className="mt-[18px] flex gap-2.5">
      {onDelete && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          transition={SPRING}
          onClick={onDelete}
          aria-label="Eliminar"
          className="flex h-12 w-12 flex-none cursor-pointer items-center justify-center rounded-full"
          style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--danger)' }}
        >
          <Trash2 size={17} />
        </motion.button>
      )}
      {secondary && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          transition={SPRING}
          onClick={secondary}
          className="liquid-glass-ic h-12 flex-1 cursor-pointer rounded-full text-[14px] font-extrabold"
          style={{ color: 'var(--text-secondary)' }}
        >
          {onBack ? 'Atrás' : 'Cancelar'}
        </motion.button>
      )}
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        transition={SPRING}
        onClick={onNext}
        disabled={pending}
        className="h-12 flex-1 cursor-pointer rounded-full text-[14px] font-extrabold disabled:opacity-50"
        style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
      >
        {pending ? 'Guardando...' : nextLabel}
      </motion.button>
    </div>
  )
}
