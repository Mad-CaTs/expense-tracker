'use client'

import { motion } from 'framer-motion'

import type { CategoryBreakdown as CategoryBreakdownType } from '@/types'

export function CategoryBreakdown({ breakdown }: { breakdown: CategoryBreakdownType[] }) {
  if (!breakdown.length) return null

  return (
    <div className="rounded-[18px] border p-[1px]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
      <div className="rounded-[17px] p-5" style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}>
        <p className="mb-4 text-[9px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--text-placeholder)' }}>
          Por categoría
        </p>
        <div className="flex flex-col gap-3">
          {breakdown.map(({ categoryName, total, percentage }, i) => (
            <div key={categoryName} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{categoryName}</span>
                <span className="mono-amount text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  S/ {(total ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full" style={{ background: 'var(--border-subtle)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage ?? 0}%` }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: 'easeOut' }}
                  className="bg-gold h-full rounded-full"
                />
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{(percentage ?? 0).toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
