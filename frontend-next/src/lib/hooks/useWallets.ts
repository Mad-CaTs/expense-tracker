import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useFilterStore } from '@/stores/filterStore'

import {
  createWallet,
  deleteWallet,
  getWallet,
  getWallets,
  updateWallet,
} from '@/lib/api/wallets'
import { DEFAULT_CURRENCY, type CurrencyId } from '@/lib/utils/currency'
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

/**
 * Moneda de la billetera activa, o la que se pida por id.
 *
 * Las pantallas que muestran importes casi siempre conocen la billetera solo
 * por su id (el del store de filtros), y pedir el objeto entero en cada una
 * para leer un símbolo era plomería repetida. Lee del cache de `['wallets']`,
 * que ya está cargado en todas ellas, así que no dispara peticiones nuevas.
 *
 * Cae en soles mientras los datos no están: es lo que la app mostraba antes de
 * que la moneda fuese configurable, y evita un parpadeo de símbolo al cargar.
 */
export function useWalletCurrency(walletId?: number | null): CurrencyId {
  const activeId = useFilterStore((s) => s.walletId)
  const id = walletId ?? activeId
  const { data: wallets } = useWallets()

  const found = wallets?.find((w) => w.id === id)?.currency
  return (found as CurrencyId | undefined) ?? DEFAULT_CURRENCY
}
