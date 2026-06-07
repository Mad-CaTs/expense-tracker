import type { Transfer, TransferPage } from '@/types'

import { apiClient } from './client'

export async function getTransfers(params: {
  page: number
  size: number
}): Promise<TransferPage> {
  const res = await apiClient.get<TransferPage>('/transfers', { params })
  return res.data
}

export async function createTransfer(data: {
  amount: number
  description?: string
  date: string
  fromWalletId: number
  toWalletId: number
}): Promise<Transfer> {
  const res = await apiClient.post<Transfer>('/transfers', data)
  return res.data
}
