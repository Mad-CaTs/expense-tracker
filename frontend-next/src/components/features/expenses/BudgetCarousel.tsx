'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Car, Ellipsis, Film, HeartPulse, Home,
  type LucideIcon, Plus, Utensils, Wallet, Zap,
} from 'lucide-react'

import { BudgetSheet } from '@/components/features/budgets/BudgetSheet'
import { useBudgets } from '@/lib/hooks/useBudgets'
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

function BudgetMiniCard({ budget, index }: { budget: Budget; index: number }) {
  const pct = Math.min(budget.percentage ?? 0, 100)
  const spent = budget.spent ?? 0
  const amount = budget.amount ?? 0
  const remaining = amount - spent
  const isOver = (budget.percentage ?? 0) > 100
  const isNear = (budget.percentage ?? 0) > 80 && !isOver
  const color = budget.categoryColor ?? '#d4af37'
  const Icon = budget.categoryIcon ? (ICON_MAP[budget.categoryIcon] ?? Wallet) : Wallet

  const barColor = isOver ? '#ef4444' : isNear ? '#f97316' : color

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
      className="flex-shrink-0 rounded-[18px] border p-[1px]"
      style={{
        width: 'calc((100vw - 2.5rem) * 0.42)',
        maxWidth: '180px',
        minWidth: '140px',
        borderColor: 'var(--border-subtle)',
        background: 'var(--bg-subtle)',
        boxShadow: 'var(--soft-raised-sm)',
      }}
    >
      <div
        className="flex flex-col gap-3 rounded-[17px] px-3.5 py-3.5"
        style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}
      >
        {/* Icon + name */}
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ background: `${color}18` }}
          >
            <Icon size={14} style={{ color }} strokeWidth={1.6} />
          </div>
          <p className="truncate text-[12px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
            {budget.categoryName ?? 'Sin cat.'}
          </p>
        </div>

        {/* Spent / total */}
        <div>
          <p className="mono-amount text-[15px] font-extrabold leading-none" style={{ color: 'var(--text-primary)' }}>
            S/ {spent.toFixed(0)}
          </p>
          <p className="mono-amount mt-0.5 text-[10px]" style={{ color: 'var(--text-placeholder)' }}>
            de S/ {amount.toFixed(0)}
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-[3px] overflow-hidden rounded-full" style={{ background: 'var(--border-subtle)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1], delay: index * 0.05 + 0.1 }}
            className="h-full rounded-full"
            style={{ background: barColor }}
          />
        </div>

        {/* Remaining */}
        <p
          className="text-[10px] font-medium"
          style={{ color: isOver ? 'var(--danger)' : isNear ? 'var(--warning)' : 'var(--text-muted)' }}
        >
          {isOver ? `+S/ ${Math.abs(remaining).toFixed(0)} excedido` : `S/ ${remaining.toFixed(0)} rest.`}
        </p>
      </div>
    </motion.div>
  )
}

export function BudgetCarousel() {
  const { data: budgets = [] } = useBudgets()
  const [showSheet, setShowSheet] = useState(false)

  return (
    <>
      <div className="pt-2 pb-1">

        <div
          className="flex gap-2.5 overflow-x-auto px-4 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {budgets.map((b, i) => (
            <BudgetMiniCard key={b.id} budget={b} index={i} />
          ))}

          <motion.button
            type="button"
            onClick={() => setShowSheet(true)}
            whileTap={{ scale: 0.96 }}
            className="flex-shrink-0 rounded-[18px] border border-dashed flex flex-col items-center justify-center gap-1.5"
            style={{
              width: '90px',
              minHeight: '130px',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-placeholder)',
            }}
          >
            <Plus size={18} />
            <span className="text-[10px] font-medium text-center leading-tight px-1">Nuevo presupuesto</span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showSheet && <BudgetSheet onClose={() => setShowSheet(false)} />}
      </AnimatePresence>
    </>
  )
}
