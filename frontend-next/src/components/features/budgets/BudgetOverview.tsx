'use client'

import { motion } from 'framer-motion'

import type { Budget } from '@/types'

const RADIUS = 34
const STROKE = 7
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function BudgetOverview({ budgets }: { budgets: Budget[] }) {
  const totalLimit = budgets.reduce((s, b) => s + (b.amount ?? 0), 0)
  const totalSpent = budgets.reduce((s, b) => s + (b.spent ?? 0), 0)
  const remaining = totalLimit - totalSpent
  const pct = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0
  const isOver = pct > 100
  const isNear = pct > 80 && !isOver

  const ringColor = isOver ? 'var(--danger)' : isNear ? 'var(--warning)' : 'var(--accent-light)'
  const dash = (Math.min(pct, 100) / 100) * CIRCUMFERENCE

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      className="mb-4 rounded-[18px] border p-[1px]"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}
    >
      <div
        className="flex items-center gap-5 rounded-[17px] p-5"
        style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}
      >
        {/* Ring */}
        <div className="relative flex-shrink-0" style={{ width: 84, height: 84 }}>
          <svg width="84" height="84" viewBox="0 0 84 84" className="-rotate-90">
            <circle cx="42" cy="42" r={RADIUS} fill="none" stroke="var(--border-subtle)" strokeWidth={STROKE} />
            <motion.circle
              cx="42"
              cy="42"
              r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: CIRCUMFERENCE - dash }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="mono-amount text-[17px] font-extrabold leading-none" style={{ color: ringColor }}>
              {Math.round(pct)}%
            </span>
            <span className="text-[8px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-placeholder)' }}>
              usado
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Este mes
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="mono-amount text-[22px] font-extrabold leading-none" style={{ color: 'var(--text-primary)' }}>
              S/ {totalSpent.toFixed(0)}
            </span>
            <span className="mono-amount text-[12px]" style={{ color: 'var(--text-placeholder)' }}>
              de S/ {totalLimit.toFixed(0)}
            </span>
          </div>
          <p
            className="mt-1.5 text-[11px] font-medium"
            style={{ color: isOver ? 'var(--danger)' : isNear ? 'var(--warning)' : 'var(--text-muted)' }}
          >
            {isOver
              ? `Excedido S/ ${Math.abs(remaining).toFixed(2)}`
              : `S/ ${remaining.toFixed(2)} disponible`}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
