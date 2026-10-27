'use client'

import { useCallback } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  breakPiggyBank,
  createPiggyBank,
  getPiggyBanks,
  getPiggyMovements,
  getWalletPiggyMovements,
  movePiggyBank,
  renamePiggyBank,
} from '@/lib/api/piggyBanks'
import type { PiggyMovementType } from '@/types'

export function usePiggyBanks(walletId: number | undefined) {
  return useQuery({
    queryKey: ['piggy-banks', walletId ?? null],
    queryFn: () => getPiggyBanks(walletId as number),
    enabled: walletId != null,
  })
}

export function usePiggyMovements(id: number | undefined) {
  return useQuery({
    queryKey: ['piggy-banks', 'movements', id ?? null],
    queryFn: () => getPiggyMovements(id as number),
    enabled: id != null,
  })
}

/** Para la lista de Reportes. Desactivable: con un filtro de tipo o categoría
 *  estos movimientos no entran y la consulta sobra. */
export function useWalletPiggyMovements(walletId: number | undefined, from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: ['piggy-banks', 'wallet-movements', walletId ?? null, from, to],
    queryFn: () => getWalletPiggyMovements(walletId as number, from, to),
    enabled: enabled && walletId != null,
  })
}

/**
 * Lo que cambia al guardar, sacar o romper: las alcancías y el saldo de la
 * billetera (el disponible y sus cierres mensuales cuelgan de `wallets`).
 *
 * Diferido a `refresh`, como en gastos e ingresos: invalidar al instante movía
 * los saldos detrás del aviso de éxito.
 */
export function useSavingsRefresh() {
  const qc = useQueryClient()
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: ['piggy-banks'] })
    qc.invalidateQueries({ queryKey: ['wallets'] })
  }, [qc])
}

export function useCreatePiggyBank() {
  const refresh = useSavingsRefresh()
  const mutation = useMutation({
    mutationFn: ({ walletId, name }: { walletId: number; name: string }) => createPiggyBank(walletId, name),
  })
  return { ...mutation, refresh }
}

/** Renombrar no mueve saldos ni muestra aviso: se refresca en el acto. */
export function useRenamePiggyBank() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => renamePiggyBank(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['piggy-banks'] }),
  })
}

/** Sin invalidar: lo hace quien cierra el aviso de éxito (`useSavingsRefresh`). */
export function useMovePiggyBank() {
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; type: PiggyMovementType; amount: number; date: string }) =>
      movePiggyBank(id, data),
  })
}

/** Sin invalidar: lo hace quien cierra el aviso de éxito (`useSavingsRefresh`). */
export function useBreakPiggyBank() {
  return useMutation({ mutationFn: (id: number) => breakPiggyBank(id) })
}
