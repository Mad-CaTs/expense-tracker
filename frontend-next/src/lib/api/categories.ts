import type { Category } from '@/types'

import { apiClient } from './client'

export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get<Category[]>('/categories')
  return res.data
}
