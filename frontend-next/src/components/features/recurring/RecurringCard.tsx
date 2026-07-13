'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CalendarClock, ChevronDown, Wallet } from 'lucide-react'

import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import type { RecurringExpense, RecurringFrequency } from '@/types'

const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  MONTHLY: 'Mensual',
  WEEKLY: 'Semanal',
  YEARLY: 'Anual',
}

function formatNextDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface RecurringCardProps {
  item: RecurringExpense
  index: number
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  expanded: boolean
  onExpandToggle: () => void
}

export function RecurringCard({
  item,
  index,
  onToggle,
  onDelete,
  expanded,
  onExpandToggle,
}: RecurringCardProps) {
  const Icon = item.categoryIcon ? (CATEGORY_ICON_MAP[item.categoryIcon] ?? Wallet) : Wallet
  const color = item.categoryColor ?? '#d4af37'

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
        onClick={onExpandToggle}
        className={`w-full cursor-pointer transition-colors duration-150 ${!item.active ? 'opacity-50' : ''}`}
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
            style={{ backgroundColor: `${color}14`, boxShadow: `0 0 0 1px ${color}18` }}
          >
            <Icon size={14} style={{ color }} strokeWidth={1.6} />
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {item.description}
            </p>
            <span
              className="flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide"
              style={{ background: `${color}18`, color }}
            >
              {FREQUENCY_LABELS[item.frequency]}
            </span>
            {!item.active && (
              <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase" style={{ background: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                Pausado
              </span>
            )}
          </div>

          <span className="mono-amount flex-shrink-0 text-[13px] font-bold tracking-tight" style={{ color: 'var(--text-secondary)' }}>
            S/ {(item.amount ?? 0).toFixed(2)}
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
            className="overflow-hidden border-t"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}
          >
            <div className="space-y-3 px-4 py-3.5">
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-placeholder)' }}>Categoría</p>
                  <p style={{ color: 'var(--text-secondary)' }}>{item.categoryName}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-placeholder)' }}>Próximo cobro</p>
                  <div className="flex items-center gap-1">
                    <CalendarClock size={11} style={{ color: 'var(--text-muted)' }} />
                    <p className="font-mono" style={{ color: 'var(--text-secondary)' }}>{formatNextDate(item.nextDate)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggle(item.id) }}
                  className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  {item.active ? (
                    <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg> Pausar</>
                  ) : (
                    <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg> Activar</>
                  )}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
                  className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                  style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
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
