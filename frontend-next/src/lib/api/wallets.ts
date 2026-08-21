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
  leather?: string
  backgroundId?: number | null
}): Promise<Wallet> {
  const res = await apiClient.post<Wallet>('/wallets', data)
  return res.data
}

/**
 * El PUT del backend REEMPLAZA: asigna `leather` incondicionalmente, igual que
 * `color` e `icon`. Omitirlo aquí no lo deja como está — lo pone a null y la
 * billetera pierde su acabado. Todo formulario que actualice debe mandarlo.
 */
export async function updateWallet(
  id: number,
  data: {
    name: string
    /**
     * Saldo que la cuenta real tiene HOY, no el inicial: el backend recalcula el
     * inicial hacia atrás para que el derivado cuadre con este número. Omitirlo
     * deja el saldo como está (a diferencia de `leather`, que sí se reemplaza).
     */
    currentBalance?: number
    color?: string
    icon?: string
    leather?: string
    backgroundId?: number | null
  }
): Promise<Wallet> {
  const res = await apiClient.put<Wallet>(`/wallets/${id}`, data)
  return res.data
}

export async function deleteWallet(id: number): Promise<void> {
  await apiClient.delete(`/wallets/${id}`)
}
