'use client'

import { useMemo } from 'react'

import { byRecent } from '@/components/features/shared/movementOrder'
import { useExpenses } from '@/lib/hooks/useExpenses'
import { useIncomes } from '@/lib/hooks/useIncomes'
import type { CategoryType } from '@/types'

const PAGE_SIZE = 100

function fullRange(): { from: string; to: string } {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    from: '2000-01-01',
    to: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
  }
}

export interface CategoryMovement {
  key: string
  description: string
  amount: number
  date: string
  id: number
  createdAt?: string
}

export function useCategoryMovements(categoryId: number, categoryName: string, type: CategoryType) {
  const isIncome = type === 'INCOME'
  const { from, to } = fullRange()

  const expenses = useExpenses({
    period: 'CUSTOM',
    startDate: from,
    endDate: to,
    categoryId,
    page: 0,
    size: PAGE_SIZE,
  })
  const incomes = useIncomes({ from, to, page: 0, size: PAGE_SIZE })

  const movements = useMemo<CategoryMovement[]>(() => {
    if (isIncome) {
      return (incomes.data?.content ?? [])
        .filter((i) => i.categoryName === categoryName)
        .map((i) => ({
          key: `i-${i.id}`,
          id: i.id,
          description: i.description ?? 'Ingreso',
          amount: Math.abs(i.amount),
          date: i.date,
          createdAt: i.createdAt,
        }))
        .sort(byRecent)
    }
    return (expenses.data?.content ?? [])
      .map((e) => ({
        key: `e-${e.id}`,
        id: e.id,
        description: e.description,
        amount: -Math.abs(e.amount),
        date: e.date,
        createdAt: e.createdAt,
      }))
      .sort(byRecent)
  }, [isIncome, expenses.data, incomes.data, categoryName])

  return {
    movements,
    isLoading: isIncome ? incomes.isLoading : expenses.isLoading,
  }
}
