'use client'

import {
  Car,
  Ellipsis,
  Film,
  HeartPulse,
  Home,
  type LucideIcon,
  Trash2,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'

import type { Budget } from '@/types'

const ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  'heart-pulse': HeartPulse,
  film: Film,
  home: Home,
  ellipsis: Ellipsis,
  wallet: Wallet,
  zap: Zap,
}

interface BudgetCardProps {
  budget: Budget
  index: number
  onDelete?: (id: number) => void
}

export function BudgetCard({ budget, index, onDelete }: BudgetCardProps) {
  const pct = Math.min(budget.percentage ?? 0, 100)
  const spent = budget.spent ?? 0
  const amount = budget.amount ?? 0
  const remaining = amount - spent
  const isOverBudget = (budget.percentage ?? 0) > 100
  const isNearLimit = (budget.percentage ?? 0) > 80 && !isOverBudget

  const Icon = budget.categoryIcon ? (ICON_MAP[budget.categoryIcon] ?? Wallet) : Wallet
  const color = budget.categoryColor ?? '#d4af37'

  const barGradient = isOverBudget
    ? '#ef4444'
    : isNearLimit
      ? 'linear-gradient(90deg, #f97316, #fb923c)'
      : 'linear-gradient(90deg, #d4af37, #f0d060)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      className="rounded-[18px] border p-[1px]"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}
    >
      <div
        className="flex flex-col gap-4 rounded-[17px] p-5"
        style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}14`, boxShadow: `0 0 0 1px ${color}18` }}
            >
              <Icon size={16} style={{ color }} strokeWidth={1.6} />
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {budget.categoryName ?? 'Sin categoría'}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                {budget.month}/{budget.year}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-right">
              <p className="mono-amount text-[13px] font-bold" style={{ color: 'var(--text-secondary)' }}>
                S/ {(spent ?? 0).toFixed(2)}
              </p>
              <p className="mono-amount text-[11px]" style={{ color: 'var(--text-dim)' }}>
                de S/ {(amount ?? 0).toFixed(2)}
              </p>
            </div>
            {onDelete && (
              <button
                onClick={() => onDelete(budget.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444' }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)' }}
                aria-label="Eliminar presupuesto"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-[3px] overflow-hidden rounded-full" style={{ background: 'var(--border-subtle)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: index * 0.06 + 0.12 }}
            className="h-full rounded-full"
            style={{ background: barGradient }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span
            className="text-[11px] font-medium"
            style={{ color: isOverBudget ? 'var(--danger)' : isNearLimit ? 'var(--warning)' : 'var(--text-muted)' }}
          >
            {isOverBudget
              ? `Excedido S/ ${Math.abs(remaining).toFixed(2)}`
              : `S/ ${remaining.toFixed(2)} restante`}
          </span>
          <span
            className="mono-amount text-[11px] font-semibold"
            style={{ color: isOverBudget ? 'var(--danger)' : isNearLimit ? 'var(--warning)' : 'var(--text-muted)' }}
          >
            {Math.round(budget.percentage ?? 0)}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}
