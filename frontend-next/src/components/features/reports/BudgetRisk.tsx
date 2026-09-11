'use client'

import { categorySwatch } from '@/lib/utils/cardVisuals'
import type { Budget, CategoryBreakdown } from '@/types'
import { useWalletCurrency } from '@/lib/hooks/useWallets'
import { symbolOf } from '@/lib/utils/currency'

const money = (n: number) =>
  n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

/** A partir de acá el presupuesto se considera "en riesgo". */
const WARN_RATIO = 0.8

export interface BudgetUsage {
  categoryName: string
  color?: string
  spent: number
  limit: number
  /** `spent / limit`; puede pasar de 1 si se excedió. */
  ratio: number
}

/**
 * Cruza lo gastado con los presupuestos definidos.
 *
 * Ordena por porcentaje consumido, no por importe: un presupuesto pequeño ya
 * excedido importa más que uno grande a medias. Es el único bloque que dice
 * qué hacer y no solo qué pasó.
 */
export function buildBudgetUsage(
  budgets: Budget[],
  breakdown: CategoryBreakdown[],
): BudgetUsage[] {
  const spentByCategory = new Map(breakdown.map((b) => [b.categoryName, b.total ?? 0]))

  return budgets
    .filter((b) => b.categoryName && b.amount > 0)
    .map((b) => {
      const spent = spentByCategory.get(b.categoryName as string) ?? 0
      return {
        categoryName: b.categoryName as string,
        color: b.categoryColor,
        spent,
        limit: b.amount,
        ratio: spent / b.amount,
      }
    })
    .sort((a, b) => b.ratio - a.ratio)
}

export function BudgetRisk({ usage }: { usage: BudgetUsage[] }) {
  const sym = symbolOf(useWalletCurrency())
  if (usage.length === 0) return null

  return (
    <ul className="flex flex-col gap-[15px]">
      {usage.map((u) => {
        const over = u.ratio > 1
        const warn = !over && u.ratio >= WARN_RATIO
        const tint = categorySwatch(u.color ?? '#d4af37')
        // El color habla del riesgo, no de la categoría: excedido en rojo,
        // cerca del límite en ámbar, holgado en el tinte de la categoría.
        const barColor = over ? 'var(--danger)' : warn ? 'var(--warning)' : tint

        return (
          <li key={u.categoryName}>
            <div className="mb-[6px] flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-[12.5px] font-bold" style={{ color: 'var(--text-primary)' }}>
                {u.categoryName}
              </span>
              <span className="mono-amount flex-none text-[11.5px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                {sym} {money(u.spent)} <span style={{ color: 'var(--text-muted)' }}>/ {money(u.limit)}</span>
              </span>
            </div>

            <span className="block h-[7px] w-full overflow-hidden rounded-full" style={{ background: 'var(--bg-hover)' }}>
              <span
                className="block h-full rounded-full"
                style={{ width: `${Math.min(100, u.ratio * 100)}%`, background: barColor }}
              />
            </span>

            {over && (
              <p className="mt-[5px] text-[10.5px] font-semibold" style={{ color: 'var(--danger)' }}>
                Excedido en {sym} {money(u.spent - u.limit)}
              </p>
            )}
            {warn && (
              <p className="mt-[5px] text-[10.5px]" style={{ color: 'var(--warning)' }}>
                Te queda {sym} {money(u.limit - u.spent)}
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}
