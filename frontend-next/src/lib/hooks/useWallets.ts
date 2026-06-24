import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createWallet,
  deleteWallet,
  getWallet,
  getWallets,
  updateWallet,
} from '@/lib/api/wallets'

export function useWallets() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: getWallets,
  })
}

export function useWallet(id: number) {
  return useQuery({
    queryKey: ['wallets', id],
    queryFn: () => getWallet(id),
    enabled: id > 0,
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
    mutationFn: ({ id, data }: { id: number; data: { name: string; color?: string; icon?: string; backgroundId?: number | null } }) =>
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
