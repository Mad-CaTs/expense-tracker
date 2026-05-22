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
      className="rounded-[18px] border border-[#161616] bg-[#0a0a0a] p-[1px]"
    >
      <div
        className="flex flex-col gap-4 rounded-[17px] bg-[#0e0e0e] p-5"
        style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.03)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#e8e6db]">{budget.name}</p>
            {budget.category && (
              <p className="mt-0.5 text-[11px] text-[#404040]">{budget.category.name}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[13px] font-bold text-[#e8e6db] tabular-nums">
              S/ {budget.spentAmount.toFixed(2)}
            </p>
            <p className="text-[11px] text-[#404040]">de S/ {budget.limitAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-[3px] overflow-hidden rounded-full bg-[#161616]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{
              duration: 0.7,
              ease: [0.32, 0.72, 0, 1],
              delay: index * 0.06 + 0.12,
            }}
            className="h-full rounded-full"
            style={{ background: barGradient }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span
            className="text-[11px] font-medium"
            style={{
              color: isOverBudget ? '#ef4444' : isNearLimit ? '#f97316' : '#484848',
            }}
          >
            {isOverBudget
              ? `Excedido S/ ${Math.abs(remaining).toFixed(2)}`
              : `S/ ${remaining.toFixed(2)} restante`}
          </span>
          <span
            className="text-[11px] font-semibold tabular-nums"
            style={{
              color: isOverBudget ? '#ef4444' : isNearLimit ? '#f97316' : '#484848',
            }}
          >
            {Math.round(pct)}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}
