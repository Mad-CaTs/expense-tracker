'use client'

import { motion } from 'framer-motion'

import { categorySwatch } from '@/lib/utils/cardVisuals'
import { getCategoryColor } from '@/lib/utils/categoryColors'
import type { CategoryBreakdown } from '@/types'

interface CategoryTilesProps {
  breakdown: CategoryBreakdown[]
  activeIndex: number | null
  onSelect: (index: number) => void
}

export function CategoryTiles({ breakdown, activeIndex, onSelect }: CategoryTilesProps) {
  if (!breakdown.length) return null

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {breakdown.map((item, i) => {
        const active = activeIndex === i
        const color = categorySwatch(getCategoryColor(item, i))
        return (
          <motion.button
            key={item.categoryName}
            type="button"
            onClick={() => onSelect(i)}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="liquid-glass-ic flex cursor-pointer items-center gap-[7px] rounded-[13px] px-[11px] py-[9px] text-left"
            style={{
              opacity: activeIndex === null || active ? 1 : 0.45,
              transition: 'opacity var(--dur-tint) var(--ease-sys)',
            }}
          >
            <span className="h-2 w-2 flex-none rounded-[3px]" style={{ background: color }} />
            <span className="min-w-0 flex-1 truncate text-[11.5px] font-bold" style={{ color: 'var(--text-secondary)' }}>
              {item.categoryName}
            </span>
            <span className="mono-amount flex-none text-[11.5px] font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              S/ {(item.total ?? 0).toLocaleString('es-PE', { maximumFractionDigits: 0 })}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
