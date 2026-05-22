'use client'

import { motion } from 'framer-motion'

import type { CategoryBreakdown as CategoryBreakdownType } from '@/types'

export function CategoryBreakdown({ breakdown }: { breakdown: CategoryBreakdownType[] }) {
  if (!breakdown.length) return null

  return (
    <div className="bg-[#111] rounded-2xl p-5">
      <p className="text-xs text-[#555] uppercase tracking-widest font-semibold mb-4">
        Por categoría
      </p>
      <div className="flex flex-col gap-3">
        {breakdown.map(({ category, amount, percentage }, i) => (
          <div key={category.id} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#e2e0d5] font-medium">{category.name}</span>
              <span className="tabular-nums text-sm font-bold text-[#e2e0d5]">
                S/ {amount.toFixed(2)}
              </span>
            </div>
            <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: i * 0.04, ease: 'easeOut' }}
                className="h-full rounded-full bg-gold"
              />
            </div>
            <p className="text-[10px] text-[#555]">{percentage.toFixed(1)}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}
