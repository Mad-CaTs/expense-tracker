import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createDebt,
  deleteDebt,
  getDebtPayments,
  getDebts,
  getDebtsByExpense,
  getDebtSummary,
  payDebt,
} from '@/lib/api/debts'
import type { DebtDirection } from '@/types'

export function useDebts(direction: DebtDirection) {
  return useQuery({
    queryKey: ['debts', direction],
    queryFn: () => getDebts(direction),
  })
}

/**
 * Abonos de una deuda.
 *
 * `enabled` permite PRECARGARLOS al desplegar la persona: si se piden recién al
 * abrir el historial, la altura se anima a un tamaño que cambia cuando llegan
 * los datos y el despliegue da un tirón.
 */
export function useDebtPayments(debtId?: number, enabled = true) {
  return useQuery({
    queryKey: ['debts', 'payments', debtId],
    queryFn: () => getDebtPayments(debtId as number),
    enabled: !!debtId && enabled,
  })
}

/** Reparto de un gasto al abrirlo en edición. */
export function useDebtsByExpense(expenseId?: number) {
  return useQuery({
    queryKey: ['debts', 'expense', expenseId],
    queryFn: () => getDebtsByExpense(expenseId as number),
    enabled: !!expenseId,
  })
}

export function useDebtSummary() {
  return useQuery({
    queryKey: ['debts', 'summary'],
    queryFn: getDebtSummary,
  })
}

/**
 * Cobrar mueve el saldo de una billetera, así que invalida `wallets` además de
 * `debts`. NO invalida `reports`: un cobro no es un ingreso y las estadísticas
 * no cambian — refrescarlas sería trabajo inútil y daría a entender lo contrario.
 */
function useDebtMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts'] })
      qc.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}

export function useCreateDebt() {
  return useDebtMutation(createDebt)
}

export function usePayDebt() {
  return useDebtMutation((vars: { id: number; amount: number; walletId: number; paidOn: string }) =>
    payDebt(vars.id, { amount: vars.amount, walletId: vars.walletId, paidOn: vars.paidOn }),
  )
}

export function useDeleteDebt() {
  return useDebtMutation(deleteDebt)
}
