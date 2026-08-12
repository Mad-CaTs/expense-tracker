import { useCallback } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createTransfer, getTransfers } from '@/lib/api/transfers'

export function useTransfers(params: { page: number; size: number }) {
  return useQuery({
    queryKey: ['transfers', params],
    queryFn: () => getTransfers(params),
    placeholderData: (prev) => prev,
  })
}

/**
 * Igual que en gastos e ingresos: la invalidación se difiere a `refresh` para
 * que los saldos no se muevan detrás del aviso de éxito.
 */
export function useCreateTransfer() {
  const qc = useQueryClient()
  const mutation = useMutation({ mutationFn: createTransfer })
  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['transfers'] })
    qc.invalidateQueries({ queryKey: ['wallets'] })
    qc.invalidateQueries({ queryKey: ['reports'] })
  }, [qc])
  return { ...mutation, refresh }
}
