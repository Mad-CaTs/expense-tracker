'use client'

import type { ReactNode } from 'react'

import { motion } from 'framer-motion'

export interface DropdownItem {
  /** Ícono (SVG inline Solar, usa currentColor). */
  icon: ReactNode
  label: string
  onClick: () => void
  active?: boolean
  variant?: 'default' | 'danger'
}

interface DropdownMenuProps {
  items: DropdownItem[]
  /** Alineación horizontal respecto al trigger. */
  align?: 'left' | 'right'
  className?: string
}

/**
 * Menú desplegable glass estándar de la app: card translúcida con blur,
 * ítems [ícono circular + label], activo con pill, danger en rojo.
 * Adapta el glass al tema vía tokens --glass-* (claro/oscuro).
 * Los íconos deben ser SVG Solar (currentColor).
 */
export function DropdownMenu({ items, align = 'left', className = '' }: DropdownMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
      className={`absolute top-full z-50 mt-2 w-44 rounded-[18px] p-1.5 ${align === 'right' ? 'right-0' : 'left-0'} ${className}`}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        transformOrigin: align === 'right' ? 'top right' : 'top left',
      }}
    >
      {items.map((item, i) => {
        const danger = item.variant === 'danger'
        const icColor = danger ? 'var(--danger)' : item.active ? 'var(--text-primary)' : 'var(--text-secondary)'
        return (
          <button
            key={i}
            type="button"
            onClick={item.onClick}
            className="flex w-full items-center gap-2.5 rounded-[12px] px-2 py-2 text-left transition-colors cursor-pointer"
            style={{ background: item.active ? 'var(--glass-item-active)' : 'transparent' }}
            onMouseEnter={(e) => { if (!item.active) e.currentTarget.style.background = 'var(--glass-item-active)' }}
            onMouseLeave={(e) => { if (!item.active) e.currentTarget.style.background = 'transparent' }}
          >
            <span
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center"
              style={{ color: icColor, lineHeight: 0 }}
            >
              {item.icon}
            </span>
            <span
              className="text-[14px]"
              style={{
                color: danger ? 'var(--danger)' : 'var(--text-primary)',
                fontWeight: item.active ? 600 : 500,
              }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </motion.div>
  )
}
