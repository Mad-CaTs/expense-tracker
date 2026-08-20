'use client'

import { Wallet } from 'lucide-react'

import { categorySwatch } from '@/lib/utils/cardVisuals'
import { getCategoryColor } from '@/lib/utils/categoryColors'
import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import type { CategoryBreakdown } from '@/types'

interface CategoryRankingProps {
  breakdown: CategoryBreakdown[]
}

/**
 * Ranking con el detalle que no cabe en el gráfico: monto, número de
 * movimientos y porcentaje por categoría. Las barras se miden contra la mayor,
 * no contra el total, para que la diferencia entre las últimas siga siendo
 * visible en vez de quedar todas pegadas a cero.
 */
export function CategoryRanking({ breakdown }: CategoryRankingProps) {
  if (!breakdown.length) return null

  const max = Math.max(...breakdown.map((b) => b.total ?? 0))

  return (
    <div className="flex flex-col gap-[13px]">
      {breakdown.map((item, i) => {
        const Icon = item.icon ? (CATEGORY_ICON_MAP[item.icon] ?? Wallet) : Wallet
        const color = categorySwatch(getCategoryColor(item, i))
        const count = item.count ?? 0
        return (
          <div key={item.categoryName} className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px]"
              style={{ background: `${getCategoryColor(item, i)}26` }}
            >
              <Icon size={15} strokeWidth={1.9} style={{ color }} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[12.5px] font-bold" style={{ color: 'var(--text-primary)' }}>
                  {item.categoryName}
                </span>
                <span className="mono-amount flex-none text-[12.5px] font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                  S/ {(item.total ?? 0).toLocaleString('es-PE', { maximumFractionDigits: 0 })}
                </span>
              </span>

              <span className="mt-1.5 block h-[7px] overflow-hidden rounded-full" style={{ background: 'var(--border-subtle)' }}>
                <span
                  className="enter-grow block h-full rounded-full"
                  style={{ width: `${max > 0 ? ((item.total ?? 0) / max) * 100 : 0}%`, background: color, ['--enter-i' as string]: i }}
                />
              </span>

              <span className="mt-0.5 block text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                {count} mov{count === 1 ? '' : 's'} · {Math.round(item.percentage ?? 0)}%
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
