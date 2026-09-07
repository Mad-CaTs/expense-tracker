'use client'

import { useDebtPayments } from '@/lib/hooks/useDebts'

/**
 * Trae los abonos de una deuda sin pintar nada.
 *
 * <p>Existe para que el historial ya esté en caché cuando el usuario lo abre:
 * pedirlo en ese momento hacía que la altura se animara a un tamaño que
 * cambiaba al llegar los datos, y el despliegue daba un tirón.
 */
export function DebtPaymentsPrefetch({ debtId }: { debtId: number }) {
  useDebtPayments(debtId)
  return null
}
