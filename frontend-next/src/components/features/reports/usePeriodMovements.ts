'use client'

import { useMemo } from 'react'

import { byRecent } from '@/components/features/shared/movementOrder'
import { useExpenses } from '@/lib/hooks/useExpenses'
import { useIncomes } from '@/lib/hooks/useIncomes'

const PAGE_SIZE = 100

export interface PeriodMovement {
  key: string
  id: number
  kind: 'expense' | 'income'
  description: string
  categoryName: string
  categoryColor?: string
  categoryIcon?: string
  /** Adjuntos confirmados; solo los gastos pueden tenerlos. */
  attachmentCount?: number
  /** Negativo = gasto, positivo = ingreso. */
  amount: number
  date: string
}

export interface MovementDay {
  /** Fecha ISO del grupo, para la key. */
  date: string
  /** "Hoy", "Ayer" o "9 ago." */
  label: string
  movements: PeriodMovement[]
}

/** "Hoy" y "Ayer" se nombran; el resto va como fecha corta. */
function dayLabel(iso: string): string {
  const date = new Date(`${iso.split('T')[0]}T12:00:00`)
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  const diff = Math.round((today.getTime() - date.getTime()) / 86_400_000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

export interface MovementFilters {
  /** Vacío = todas. */
  categoryIds?: number[]
  /** Billetera de la que son los movimientos. */
  walletId?: number
  txType?: 'EXPENSE' | 'INCOME' | 'ALL'
}

/**
 * Gastos e ingresos del período, mezclados y agrupados por día.
 *
 * Los dos endpoints se consultan siempre por rango y los filtros se aplican al
 * mezclar: son queries cacheadas, y alternar tipo o categorías no debería
 * disparar peticiones nuevas. El backend solo acepta UNA categoría por consulta
 * (/expenses) y ninguna en /incomes, así que con varias elegidas no hay forma
 * de delegarlo — se resuelve acá por id.
 */
export function usePeriodMovements(from: string, to: string, filters: MovementFilters = {}) {
  const { categoryIds = [], walletId, txType = 'ALL' } = filters

  const expenses = useExpenses({ period: 'CUSTOM', startDate: from, endDate: to, page: 0, size: PAGE_SIZE })
  const incomes = useIncomes({ from, to, page: 0, size: PAGE_SIZE })

  const key = `${categoryIds.join(',')}|${walletId ?? ''}`

  const days = useMemo<MovementDay[]>(() => {
    const wantedCats = new Set(categoryIds)
    const keep = (categoryId?: number, itemWallet?: number) =>
      (wantedCats.size === 0 || (categoryId != null && wantedCats.has(categoryId)))
      && (walletId == null || itemWallet === walletId)
    const wantExpenses = txType !== 'INCOME'
    const wantIncomes = txType !== 'EXPENSE'

    const all: PeriodMovement[] = [
      ...(wantExpenses ? expenses.data?.content ?? [] : []).filter((e) => keep(e.categoryId, e.walletId)).map((e) => ({
        key: `e-${e.id}`,
        id: e.id,
        kind: 'expense' as const,
        description: e.description || 'Gasto',
        categoryName: e.categoryName ?? 'Sin categoría',
        categoryColor: e.categoryColor,
        categoryIcon: e.categoryIcon,
        attachmentCount: e.attachmentCount,
        amount: -Math.abs(e.amount),
        date: e.date,
      })),
      ...(wantIncomes ? incomes.data?.content ?? [] : []).filter((i) => keep(i.categoryId, i.walletId)).map((i) => ({
        key: `i-${i.id}`,
        id: i.id,
        kind: 'income' as const,
        description: i.description || 'Ingreso',
        categoryName: i.categoryName ?? 'Sin categoría',
        categoryColor: i.categoryColor,
        categoryIcon: i.categoryIcon,
        amount: Math.abs(i.amount),
        date: i.date,
      })),
    ].sort(byRecent)

    const groups: MovementDay[] = []
    for (const m of all) {
      const day = m.date.split('T')[0]
      const last = groups[groups.length - 1]
      if (last?.date === day) last.movements.push(m)
      else groups.push({ date: day, label: dayLabel(day), movements: [m] })
    }
    return groups
  }, [expenses.data, incomes.data, txType, key])

  const totals = useMemo(() => {
    let expense = 0
    let income = 0
    for (const day of days) {
      for (const m of day.movements) {
        if (m.kind === 'expense') expense += Math.abs(m.amount)
        else income += m.amount
      }
    }
    return { expense, income }
  }, [days])

  return {
    days,
    totals,
    total: days.reduce((sum, d) => sum + d.movements.length, 0),
    isLoading: expenses.isLoading || incomes.isLoading,
  }
}
