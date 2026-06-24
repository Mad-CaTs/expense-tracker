import type { Wallet } from '@/types'

import { apiClient } from './client'

export async function getWallets(): Promise<Wallet[]> {
  const res = await apiClient.get<Wallet[]>('/wallets')
  return res.data
}

export async function getWallet(id: number): Promise<Wallet> {
  const res = await apiClient.get<Wallet>(`/wallets/${id}`)
  return res.data
}

export async function createWallet(data: {
  name: string
  initialBalance: number
  color?: string
  icon?: string
  backgroundId?: number | null
}): Promise<Wallet> {
  const res = await apiClient.post<Wallet>('/wallets', data)
  return res.data
}

export async function updateWallet(
  id: number,
  data: { name: string; color?: string; icon?: string; backgroundId?: number | null }
): Promise<Wallet> {
  const res = await apiClient.put<Wallet>(`/wallets/${id}`, data)
  return res.data
}

export async function deleteWallet(id: number): Promise<void> {
  await apiClient.delete(`/wallets/${id}`)
}
