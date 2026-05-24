'use client'

import {
  Car,
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
import { motion } from 'framer-motion'

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
}

export function ExpenseRow({ expense, onEdit, onDelete, index }: ExpenseRowProps) {
  const Icon = expense.categoryIcon ? (ICON_MAP[expense.categoryIcon] ?? Wallet) : Wallet
  const color = expense.categoryColor ?? '#d4af37'

  const formattedDate = new Date(expense.date).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      className="rounded-[18px] border p-[1px]"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}
    >
      <div
        className="flex items-center justify-between gap-3 rounded-[17px] px-4 py-3.5"
        style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}14`, boxShadow: `0 0 0 1px ${color}18` }}
          >
            <Icon size={16} style={{ color }} strokeWidth={1.6} />
          </div>
          <div>
            <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {expense.description}
            </p>
            <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-dim)' }}>
              {expense.categoryName}
              <span className="mx-1.5" style={{ color: 'var(--border-default)' }}>·</span>
              {formattedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="mono-amount text-[13px] font-bold tracking-tight" style={{ color: 'var(--text-secondary)' }}>
            S/ {(expense.amount ?? 0).toFixed(2)}
          </span>
          <div className="flex gap-0.5">
            <button
              onClick={() => onEdit(expense.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)' }}
              aria-label={`Editar ${expense.description}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(expense.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444' }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)' }}
              aria-label={`Eliminar ${expense.description}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
