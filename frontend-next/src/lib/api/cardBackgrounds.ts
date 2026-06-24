import type { CardBackground } from '@/types'

import { apiClient } from './client'

export async function getCardBackgrounds(): Promise<CardBackground[]> {
  const res = await apiClient.get<CardBackground[]>('/card-backgrounds')
  return res.data
}
