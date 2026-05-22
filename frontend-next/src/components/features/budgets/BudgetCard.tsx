'use client'

import { motion } from 'framer-motion'

import type { Budget } from '@/types'

interface BudgetCardProps {
  budget: Budget
  index: number
}

export function BudgetCard({ budget, index }: BudgetCardProps) {
  const pct = budget.limitAmount > 0 ? (budget.spentAmount / budget.limitAmount) * 100 : 0
  const remaining = budget.limitAmount - budget.spentAmount
  const isOverBudget = pct > 100
  const isNearLimit = pct > 80 && !isOverBudget

  const barColor = isOverBudget
    ? '#ef4444'
    : isNearLimit
      ? '#f97316'
      : 'linear-gradient(90deg, #d4af37, #f0d060)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[#111] rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-[#e2e0d5]">{budget.name}</p>
          {budget.category && (
            <p className="text-xs text-[#555] mt-0.5">{budget.category.name}</p>
          )}
        </div>
        <div className="text-right">
          <p className="tabular-nums text-sm font-bold text-[#e2e0d5]">
            S/ {budget.spentAmount.toFixed(2)}
          </p>
          <p className="text-xs text-[#555]">de S/ {budget.limitAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.05 + 0.1 }}
          className="h-full rounded-full"
          style={{ background: barColor }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold"
          style={{ color: isOverBudget ? '#ef4444' : isNearLimit ? '#f97316' : '#555' }}
        >
          {isOverBudget
            ? `Excedido por S/ ${Math.abs(remaining).toFixed(2)}`
            : `S/ ${remaining.toFixed(2)} restante`}
        </span>
        <span className="text-xs text-[#555]">{Math.round(pct)}%</span>
      </div>
    </motion.div>
  )
}
