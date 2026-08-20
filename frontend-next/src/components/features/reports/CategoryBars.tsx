'use client'

import { categorySwatch } from '@/lib/utils/cardVisuals'
import { getCategoryColor } from '@/lib/utils/categoryColors'
import type { CategoryBreakdown } from '@/types'

/** Marcas del eje Y, de arriba a abajo. */
const TICKS = 4

interface CategoryBarsProps {
  breakdown: CategoryBreakdown[]
  activeIndex: number | null
  onSelect: (index: number) => void
}

/** Redondea el techo a una cifra legible ("S/ 2000" y no "S/ 1987"). */
function niceMax(value: number): number {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  return Math.ceil(value / magnitude) * magnitude
}

function short(name: string): string {
  return name.length > 6 ? `${name.slice(0, 5)}.` : name
}

/**
 * El mismo reparto que el donut, como columnas comparables. Con muchas
 * categorías el donut deja segmentos de pocos grados imposibles de distinguir;
 * las columnas conservan la proporción a cualquier número.
 */
export function CategoryBars({ breakdown, activeIndex, onSelect }: CategoryBarsProps) {
  if (!breakdown.length) return null

  const max = niceMax(Math.max(...breakdown.map((b) => b.total ?? 0)))
  const ticks = Array.from({ length: TICKS + 1 }, (_, i) => Math.round(max - (max / TICKS) * i))

  return (
    <>
      <div className="flex gap-2.5">
        <div className="flex w-[38px] flex-col justify-between py-1 text-right text-[9.5px] font-bold" style={{ color: 'var(--text-dim)', height: 186 }}>
          {ticks.map((t) => <span key={t}>S/{t}</span>)}
        </div>

        <div
          className="flex flex-1 items-end justify-around gap-2 px-2"
          style={{ height: 186, borderLeft: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}
        >
          {breakdown.map((item, i) => {
            const color = categorySwatch(getCategoryColor(item, i))
            const height = `${((item.total ?? 0) / max) * 100}%`
            return (
              <button
                key={item.categoryName}
                type="button"
                onClick={() => onSelect(i)}
                aria-label={`${item.categoryName}: S/ ${(item.total ?? 0).toFixed(2)}`}
                className="flex h-full max-w-[34px] flex-1 cursor-pointer flex-col justify-end"
                style={{
                  opacity: activeIndex === null || activeIndex === i ? 1 : 0.35,
                  transition: 'opacity var(--dur-tint) var(--ease-sys)',
                }}
              >
                {/* enter-grow anima el alto desde 0 al montar, como las barras
                    de presupuestos. */}
                <span
                  className="enter-grow w-full rounded-t-[7px] rounded-b-[3px]"
                  style={{ height, background: color, ['--enter-i' as string]: i }}
                />
              </button>
            )
          })}
        </div>
      </div>

      <div className="ml-[38px] flex justify-around gap-2 px-2 pt-2">
        {breakdown.map((item, i) => (
          <span
            key={item.categoryName}
            className="max-w-[34px] flex-1 truncate text-center text-[9.5px] font-bold"
            style={{ color: activeIndex === i ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
          >
            {short(item.categoryName)}
          </span>
        ))}
      </div>
    </>
  )
}
