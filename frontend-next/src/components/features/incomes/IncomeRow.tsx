'use client'

import { ChevronDown, TrendingUp } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import type { Income } from '@/types'

interface IncomeRowProps {
  income: Income
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  index: number
  expanded: boolean
  onToggle: () => void
}

export function IncomeRow({ income, onEdit, onDelete, index, expanded, onToggle }: IncomeRowProps) {
  const color = '#4ade80'

  const formattedDate = new Date(income.date + 'T12:00:00').toLocaleDateString('es-PE', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  const shortDate = new Date(income.date + 'T12:00:00').toLocaleDateString('es-PE', {
    day: 'numeric', month: 'short',
  })

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
        onClick={onToggle}
        className="w-full cursor-pointer transition-colors duration-150"
        style={{ background: expanded ? 'var(--bg-hover)' : 'transparent' }}
        onMouseEnter={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
        onMouseLeave={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="flex-shrink-0"
          >
            <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
          </motion.div>

          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}18`, boxShadow: `0 0 0 1px ${color}22` }}
          >
            <TrendingUp size={14} style={{ color }} strokeWidth={1.6} />
          </div>

          <div className="flex min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {income.description || 'Ingreso'}
            </p>
          </div>

          <time className="flex-shrink-0 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {shortDate}
          </time>

          <span className="mono-amount flex-shrink-0 text-[13px] font-bold tracking-tight" style={{ color: 'var(--success)' }}>
            + S/ {(income.amount ?? 0).toFixed(2)}
          </span>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
            style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}
          >
            <div className="space-y-3 px-4 py-3.5">
              {income.notes && (
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-placeholder)' }}>Nota</p>
                  <p className="rounded-lg px-3 py-2 font-mono text-[12px]" style={{ background: 'var(--bg-card-inner)', color: 'var(--text-secondary)' }}>
                    {income.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-placeholder)' }}>Fecha</p>
                  <p className="font-mono" style={{ color: 'var(--text-secondary)' }}>{formattedDate}</p>
                </div>
                {income.walletName && (
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-placeholder)' }}>Wallet</p>
                    <p style={{ color: 'var(--text-secondary)' }}>{income.walletName}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(income.id) }}
                  className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-lg border text-[11px] font-semibold transition-colors"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  Editar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(income.id) }}
                  className="btn-danger-soft flex h-7 flex-1 items-center justify-center gap-1.5 rounded-lg text-[11px] font-semibold"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
