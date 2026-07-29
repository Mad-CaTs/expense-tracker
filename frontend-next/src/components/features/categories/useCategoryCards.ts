'use client'

import { useMemo } from 'react'

import { useCategories } from '@/lib/hooks/useCategories'
import { useCategoryBreakdown } from '@/lib/hooks/useReports'
import type { CategoryType } from '@/types'

import type { CategoryCardData } from './CategoryCard'

/** Rango del mes en curso, en formato ISO corto. */
function monthRange(): { from: string; to: string } {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = now.getFullYear()
  const m = now.getMonth()
  const last = new Date(y, m + 1, 0).getDate()
  return { from: `${y}-${pad(m + 1)}-01`, to: `${y}-${pad(m + 1)}-${pad(last)}` }
}

export interface CategoryCardsResult {
  cards: CategoryCardData[]
  isLoading: boolean
  total: number
  topCategory: string | null
  movementCount: number
}

/**
 * Combina las categorías con el gasto del mes.
 *
 * El breakdown SOLO devuelve categorías con movimientos, así que las que no
 * gastaron no aparecen ahí: si se leyera solo de esa fuente, el grid perdería
 * justamente las que van atenuadas. La lista de categorías manda y el breakdown
 * se cruza por nombre, con 0 por defecto.
 *
 * Orden: primero las que gastaron (de mayor a menor), después las sin uso
 * alfabéticamente — así el grid arranca por lo que importa y las vacías caen
 * al final sin desordenarse entre sí.
 */
export function useCategoryCards(type: CategoryType): CategoryCardsResult {
  const { data: categories = [], isLoading: loadingCategories } = useCategories()
  const { from, to } = useMemo(() => monthRange(), [])
  const { data: breakdown, isLoading: loadingBreakdown } = useCategoryBreakdown({ period: 'CUSTOM', from, to, txType: type })

  // AMBAS consultas: con solo las categorías el grid se pintaba entero en S/ 0 y
  // atenuado, y al llegar el breakdown se recoloreaba y reordenaba de golpe —
  // se veía como un temblor al entrar a la pantalla.
  const isLoading = loadingCategories || loadingBreakdown

  return useMemo(() => {
    const usage = new Map<string, { total: number; count: number; percentage: number }>()
    for (const b of breakdown ?? []) {
      usage.set(b.categoryName, {
        total: b.total ?? 0,
        count: b.count ?? 0,
        percentage: b.percentage ?? 0,
      })
    }

    const cards: CategoryCardData[] = categories
      .filter((c) => (type === 'INCOME' ? c.type === 'INCOME' : c.type !== 'INCOME'))
      .map((c) => {
        const u = usage.get(c.name)
        return {
          id: c.id,
          name: c.name,
          icon: c.icon ?? 'ellipsis',
          color: c.color ?? '#d4af37',
          total: u?.total ?? 0,
          count: u?.count ?? 0,
          percentage: u?.percentage ?? 0,
        }
      })
      .sort((a, b) => {
        if (a.total !== b.total) return b.total - a.total
        return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
      })

    const total = cards.reduce((s, c) => s + c.total, 0)
    const movementCount = cards.reduce((s, c) => s + c.count, 0)
    const top = cards[0]

    return {
      cards,
      isLoading,
      total,
      topCategory: top && top.total > 0 ? top.name : null,
      movementCount,
    }
  }, [categories, breakdown, type, isLoading])
}
