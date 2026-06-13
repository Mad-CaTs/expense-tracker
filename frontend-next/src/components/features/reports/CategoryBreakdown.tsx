'use client'

import { motion } from 'framer-motion'

import type { LinkedHighlightProps } from '@/components/features/reports/DistributionSection'
import { getCategoryColor } from '@/lib/utils/categoryColors'

const DIMMED_ROW_OPACITY = 0.45

export function CategoryBreakdown({ breakdown, activeIndex, onHover, onSelect }: LinkedHighlightProps) {
  if (!breakdown.length) return null

  return (
    <div className="px-4">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        Por categoría
      </p>
      <div className="rounded-[18px] border p-[1px]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
        <div className="rounded-[17px] p-5" style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}>
          <div className="flex flex-col gap-1">
            {breakdown.map((item, i) => {
              const { categoryName, total, percentage, count } = item
              const color = getCategoryColor(item, i)
              const isActive = activeIndex === i
              const isDimmed = activeIndex !== null && !isActive
              return (
                <button
                  key={categoryName}
                  type="button"
                  onMouseEnter={() => onHover(i)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => onSelect(i)}
                  className="-mx-2 flex w-[calc(100%+16px)] select-none flex-col gap-1.5 rounded-xl px-2 py-2 text-left transition-[background,opacity] duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-ring)]"
                  style={{
                    background: isActive ? 'var(--bg-hover)' : 'transparent',
                    opacity: isDimmed ? DIMMED_ROW_OPACITY : 1,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color }} />
                      <span className="truncate text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {categoryName}
                      </span>
                      {count != null && (
                        <span className="flex-shrink-0 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          · {count} {count === 1 ? 'mov' : 'movs'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-shrink-0 items-baseline gap-2">
                      <span className="mono-amount text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                        {(percentage ?? 0).toFixed(1)}%
                      </span>
                      <span className="mono-amount text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        S/ {(total ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full" style={{ background: 'var(--border-subtle)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage ?? 0}%` }}
                      transition={{ duration: 0.5, delay: i * 0.04, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
