'use client'

import { useMemo } from 'react'

import { useActiveWallet } from '@/lib/hooks/useActiveWallet'
import { useCategories } from '@/lib/hooks/useCategories'
import { useCategoryBreakdown } from '@/lib/hooks/useReports'
import type { CategoryType } from '@/types'

import type { CategoryCardData } from './CategoryCard'

export interface CategoryCardsResult {
  cards: CategoryCardData[]
  isLoading: boolean
  total: number
  topCategory: string | null
  movementCount: number
}

/** Período del que son las cifras; lo decide la pantalla con su filtro. */
export interface CategoryCardsRange {
  from: string
  to: string
}

export function useCategoryCards(type: CategoryType, range: CategoryCardsRange): CategoryCardsResult {
  /* TODAS las categorías: esta pantalla las administra, así que también debe
     mostrar las ocultas (marcadas). El segundo listado, filtrado por la
     billetera activa, dice cuáles se ofrecen ahí; la diferencia es lo oculto. */
  const { data: categories = [], isLoading: loadingCategories } = useCategories()
  const activeWalletId = useActiveWallet()
  const { data: visibles } = useCategories(undefined, activeWalletId)
  const { data: breakdown, isLoading: loadingBreakdown } = useCategoryBreakdown(
    { period: 'CUSTOM', from: range.from, to: range.to, txType: type, walletId: activeWalletId },
    { requireWallet: true },
  )

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

    // `undefined` mientras carga: sin datos no se marca nada como oculto.
    const visibleIds = visibles ? new Set(visibles.map((c) => c.id)) : null

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
          hidden: visibleIds != null && !visibleIds.has(c.id),
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
  }, [categories, visibles, breakdown, type, isLoading])
}
