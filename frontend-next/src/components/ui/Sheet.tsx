'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import { motion, useReducedMotion } from 'framer-motion'

interface SheetProps {
  onClose: () => void
  title?: string
  children: ReactNode
}

/**
 * Bottom sheet animado. Sube desde abajo con spring, backdrop con fade,
 * drag-to-dismiss por velocidad/distancia, cierra con Escape/backdrop/drag.
 * Debe renderizarse dentro de un <AnimatePresence> (en SheetHost).
 */
export function Sheet({ onClose, title, children }: SheetProps) {
  const reduce = useReducedMotion()
  const dragStartY = useRef(0)
  const dragStartTime = useRef(0)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { y: '100%' }}
        animate={reduce ? { opacity: 1 } : { y: 0 }}
        exit={reduce ? { opacity: 0 } : { y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 36 }}
        drag={reduce ? false : 'y'}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragStart={(_, info) => { dragStartY.current = info.point.y; dragStartTime.current = Date.now() }}
        onDragEnd={(_, info) => {
          const distance = info.point.y - dragStartY.current
          const elapsed = Date.now() - dragStartTime.current
          const velocity = Math.abs(distance) / Math.max(1, elapsed)
          if (distance > 120 || velocity > 0.11) onClose()
        }}
        className="relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[var(--r-lg)]"
        style={{ background: 'var(--surface-overlay)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <span className="h-1 w-10 rounded-full" style={{ background: 'var(--border-strong)' }} />
        </div>

        {title && (
          <p className="t-label px-5 pb-2 pt-1 uppercase tracking-[0.14em]" style={{ color: 'var(--text-placeholder)' }}>
            {title}
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
