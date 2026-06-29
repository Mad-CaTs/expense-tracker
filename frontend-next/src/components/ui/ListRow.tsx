'use client'

import type { ReactNode } from 'react'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface ListRowProps {
  Icon: LucideIcon
  /** Color de la categoría/contexto para el contenedor del ícono. */
  color: string
  title: string
  subtitle?: string
  /** Contenido a la derecha (monto, fecha, etc.). */
  trailing?: ReactNode
  onClick?: () => void
  index?: number
}

/** Fila canónica: [ícono coloreado] título + subtítulo tenue · trailing. Sin bordes. */
export function ListRow({ Icon, color, title, subtitle, trailing, onClick, index = 0 }: ListRowProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="flex w-full items-center gap-3 px-2 py-3 text-left transition-colors cursor-pointer rounded-[var(--r-md)]"
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--r-sm)]"
        style={{ background: `${color}14` }}
      >
        <Icon size={16} style={{ color }} strokeWidth={1.7} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="t-body truncate" style={{ color: 'var(--text-primary)' }}>{title}</p>
        {subtitle && (
          <p className="t-caption truncate" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        )}
      </div>

      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </motion.button>
  )
}
