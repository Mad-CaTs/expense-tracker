'use client'

import { useMemo } from 'react'

import { byRecent } from '@/components/features/shared/movementOrder'
import { useExpenses } from '@/lib/hooks/useExpenses'
import { useIncomes } from '@/lib/hooks/useIncomes'

const PAGE_SIZE = 50

export interface WalletMovement {
  key: string
  description: string
  /** Negativo = gasto, positivo = ingreso. */
  amount: number
  date: string
  /** Id del recurso. Solo desempata entre movimientos del mismo tipo: gastos e
   *  ingresos viven en tablas con secuencias independientes. */
  id: number
  /** Instante de alta: el desempate real dentro de un mismo día, porque este
   *  feed mezcla gastos e ingresos. Puede faltar en registros antiguos. */
  createdAt?: string
  categoryName: string
  categoryIcon?: string
  categoryColor?: string
  /** Qué formulario abre la fila al tocarla. */
  kind: 'expense' | 'income'
  /** Adjuntos confirmados; solo los gastos pueden tenerlos. */
  attachmentCount?: number
}

/**
 * Feed unificado de movimientos de una billetera: gastos e ingresos mezclados
 * y ordenados del más reciente al más antiguo (los dos recursos viven en hooks
 * separados).
 */
export function useWalletMovements(walletId: number) {
  const expenses = useExpenses({ period: 'CUSTOM', walletId, page: 0, size: PAGE_SIZE })
  const incomes = useIncomes({ walletId, page: 0, size: PAGE_SIZE })

  const movements = useMemo<WalletMovement[]>(() => {
    const out: WalletMovement[] = []
    for (const e of expenses.data?.content ?? []) {
      out.push({
        key: `e-${e.id}`,
        id: e.id,
        createdAt: e.createdAt,
        kind: 'expense',
        attachmentCount: e.attachmentCount,
        description: e.description,
        amount: -Math.abs(e.amount),
        date: e.date,
        categoryName: e.categoryName,
        categoryIcon: e.categoryIcon,
        categoryColor: e.categoryColor,
      })
    }
    for (const i of incomes.data?.content ?? []) {
      out.push({
        key: `i-${i.id}`,
        id: i.id,
        createdAt: i.createdAt,
        kind: 'income',
        description: i.description ?? 'Ingreso',
        amount: Math.abs(i.amount),
        date: i.date,
        categoryName: i.categoryName ?? 'Ingreso',
        categoryIcon: i.categoryIcon,
        categoryColor: i.categoryColor,
      })
    }
    return out.sort(byRecent)
  }, [expenses.data, incomes.data])

  return { movements, isLoading: expenses.isLoading || incomes.isLoading }
}
