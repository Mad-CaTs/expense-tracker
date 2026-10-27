import type { PiggyBank, PiggyMovement, PiggyMovementType, WalletPiggyMovement } from '@/types'

import { apiClient } from './client'

export async function getPiggyBanks(walletId: number): Promise<PiggyBank[]> {
  const res = await apiClient.get<PiggyBank[]>(`/wallets/${walletId}/piggy-banks`)
  return res.data
}

export async function createPiggyBank(walletId: number, name: string): Promise<PiggyBank> {
  const res = await apiClient.post<PiggyBank>(`/wallets/${walletId}/piggy-banks`, { name })
  return res.data
}

export async function renamePiggyBank(id: number, name: string): Promise<PiggyBank> {
  const res = await apiClient.put<PiggyBank>(`/piggy-banks/${id}`, { name })
  return res.data
}

/** Guardar o sacar. Devuelve la alcancía con su nuevo saldo. */
export async function movePiggyBank(
  id: number,
  data: { type: PiggyMovementType; amount: number; date: string },
): Promise<PiggyBank> {
  const res = await apiClient.post<PiggyBank>(`/piggy-banks/${id}/movements`, data)
  return res.data
}

export async function getPiggyMovements(id: number): Promise<PiggyMovement[]> {
  const res = await apiClient.get<PiggyMovement[]>(`/piggy-banks/${id}/movements`)
  return res.data
}

/** Romper: lo que tenga vuelve al saldo disponible y la alcancía se archiva. */
export async function breakPiggyBank(id: number): Promise<void> {
  await apiClient.delete(`/piggy-banks/${id}`)
}

/** Todo lo guardado y sacado en la billetera en el rango, rotas incluidas. */
export async function getWalletPiggyMovements(
  walletId: number,
  from: string,
  to: string,
): Promise<WalletPiggyMovement[]> {
  const res = await apiClient.get<WalletPiggyMovement[]>(`/wallets/${walletId}/piggy-movements`, {
    params: { from, to },
  })
  return res.data
}
