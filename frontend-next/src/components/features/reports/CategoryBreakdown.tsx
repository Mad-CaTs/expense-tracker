'use client'

import { motion } from 'framer-motion'

import type { CategoryBreakdown as CategoryBreakdownType } from '@/types'

export function CategoryBreakdown({ breakdown }: { breakdown: CategoryBreakdownType[] }) {
  if (!breakdown.length) return null

  return (
    <div className="rounded-2xl bg-[#111] p-5">
      <p className="mb-4 text-xs font-semibold tracking-widest text-[#555] uppercase">
        Por categoría
      </p>
      <div className="flex flex-col gap-3">
        {breakdown.map(({ category, amount, percentage }, i) => (
          <div key={category.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#e2e0d5]">{category.name}</span>
              <span className="text-sm font-bold text-[#e2e0d5] tabular-nums">
                S/ {amount.toFixed(2)}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-[#1a1a1a]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: i * 0.04, ease: 'easeOut' }}
                className="bg-gold h-full rounded-full"
              />
            </div>
            <p className="text-[10px] text-[#555]">{percentage.toFixed(1)}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}
