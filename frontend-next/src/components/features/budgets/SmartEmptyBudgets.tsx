'use client'

import { motion } from 'framer-motion'
import { Plus, Wallet } from 'lucide-react'

import { EmptyState } from '@/components/ui/EmptyState'
import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import type { CategoryBreakdown } from '@/types'
import { categorySwatch } from '@/lib/utils/cardVisuals'

interface SmartEmptyBudgetsProps {
  breakdown?: CategoryBreakdown[]
  onPick: (name: string) => void
}

export function SmartEmptyBudgets({ breakdown, onPick }: SmartEmptyBudgetsProps) {
  const top = (breakdown ?? [])
    .filter((b) => (b.total ?? 0) > 0 && b.categoryName !== 'Sin categoría')
    .slice(0, 4)

  if (!top.length) {
    return (
      <EmptyState
        title="Sin presupuestos"
        description="Crea un presupuesto mensual para controlar tus gastos por categoría."
      />
    )
  }

  return (
    <div>
      <EmptyState
        title="Empieza con tus mayores gastos"
        description="Ponle un límite a las categorías donde más gastaste este mes."
      />
      <div className="mt-4 flex flex-col gap-2">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Sugerencias
        </p>
        {top.map((b, i) => {
          const color = b.color ?? '#d4af37'
          const Icon = b.icon ? (CATEGORY_ICON_MAP[b.icon] ?? Wallet) : Wallet
          return (
            <motion.button
              key={b.categoryName}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              onClick={() => onPick(b.categoryName)}
              className="flex items-center gap-3 rounded-[14px] border px-4 py-3 text-left transition-colors cursor-pointer"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card-inner)' }}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
                <Icon size={15} style={{ color: categorySwatch(color) }} strokeWidth={1.6} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{b.categoryName}</p>
                <p className="mono-amount text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  S/ {(b.total ?? 0).toFixed(2)} gastado este mes
                </p>
              </div>
              <span
                className="flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)' }}
              >
                <Plus size={11} /> Límite
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
