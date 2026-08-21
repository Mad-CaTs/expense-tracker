import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createWallet,
  deleteWallet,
  getWallet,
  getWallets,
  updateWallet,
} from '@/lib/api/wallets'
import type { Wallet } from '@/types'

export function useWallets() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: getWallets,
  })
}

export function useWallet(id: number) {
  const qc = useQueryClient()

  return useQuery({
    queryKey: ['wallets', id],
    queryFn: () => getWallet(id),
    enabled: id > 0,
    initialData: () =>
      qc.getQueryData<Wallet[]>(['wallets'])?.find((w) => w.id === id),
    initialDataUpdatedAt: () => qc.getQueryState(['wallets'])?.dataUpdatedAt,
  })
}

export function useCreateWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createWallet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets'] }),
  })
}

export function useUpdateWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateWallet>[1] }) =>
      updateWallet(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets'] }),
  })
}

export function useDeleteWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteWallet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets'] }),
  })
}
