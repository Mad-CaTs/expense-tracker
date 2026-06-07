'use client'

import React from 'react'
import {
  Car,
  ChevronDown,
  Ellipsis,
  Film,
  HeartPulse,
  Home,
  type LucideIcon,
  ShoppingCart,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { AttachmentsModal } from '@/components/features/expenses/AttachmentsModal'
import type { Expense } from '@/types'

const ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  'heart-pulse': HeartPulse,
  film: Film,
  home: Home,
  ellipsis: Ellipsis,
  'shopping-cart': ShoppingCart,
  wallet: Wallet,
  zap: Zap,
}

interface ExpenseRowProps {
  expense: Expense
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  index: number
  expanded: boolean
  onToggle: () => void
}

export function ExpenseRow({ expense, onEdit, onDelete, index, expanded, onToggle }: ExpenseRowProps) {
  const [showAttachments, setShowAttachments] = React.useState(false)
  const Icon = expense.categoryIcon ? (ICON_MAP[expense.categoryIcon] ?? Wallet) : Wallet
  const color = expense.categoryColor ?? '#d4af37'

  const formattedDate = new Date(expense.date + 'T12:00:00').toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const shortDate = new Date(expense.date + 'T12:00:00').toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
        onClick={onToggle}
        className="w-full cursor-pointer transition-colors duration-150"
        style={{
          background: expanded ? 'var(--bg-hover)' : 'transparent',
        }}
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
              {expense.description}
            </p>
            <span
              className="hidden sm:inline-flex flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide"
              style={{ background: `${color}15`, color }}
            >
              {expense.categoryName}
            </span>
          </div>

          <time className="flex-shrink-0 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {shortDate}
          </time>

          <span className="mono-amount flex-shrink-0 text-[13px] font-bold tracking-tight" style={{ color: 'var(--danger)' }}>
            - S/ {(expense.amount ?? 0).toFixed(2)}
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
              {expense.notes && (
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-placeholder)' }}>
                    Nota
                  </p>
                  <p className="rounded-lg px-3 py-2 font-mono text-[12px]" style={{ background: 'var(--bg-card-inner)', color: 'var(--text-secondary)' }}>
                    {expense.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-placeholder)' }}>
                    Fecha
                  </p>
                  <p className="font-mono" style={{ color: 'var(--text-secondary)' }}>{formattedDate}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-placeholder)' }}>
                    Categoría
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-4 w-4 items-center justify-center rounded" style={{ background: `${color}20` }}>
                      <Icon size={10} style={{ color }} strokeWidth={1.8} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>{expense.categoryName}</p>
                  </div>
                </div>
              </div>

              {(expense.attachmentCount ?? 0) > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowAttachments(true) }}
                  className="flex h-7 w-full items-center justify-center gap-1.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--accent-light)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-light)'; e.currentTarget.style.background = 'var(--accent-bg)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = '' }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Ver adjuntos ({expense.attachmentCount})
                </button>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(expense.id) }}
                  className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(expense.id) }}
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

      <AnimatePresence>
        {showAttachments && (
          <AttachmentsModal
            expenseId={expense.id}
            description={expense.description}
            onClose={() => setShowAttachments(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
