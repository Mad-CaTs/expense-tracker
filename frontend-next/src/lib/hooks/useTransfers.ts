import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createTransfer, getTransfers } from '@/lib/api/transfers'

export function useTransfers(params: { page: number; size: number }) {
  return useQuery({
    queryKey: ['transfers', params],
    queryFn: () => getTransfers(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createTransfer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transfers'] })
      qc.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}
