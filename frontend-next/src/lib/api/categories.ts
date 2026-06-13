import type { Category, CategoryType } from '@/types'

import { apiClient } from './client'

export async function getCategories(type?: CategoryType): Promise<Category[]> {
  const res = await apiClient.get<Category[]>('/categories', {
    params: type ? { type } : undefined,
  })
  return res.data
}

export async function createCategory(data: Omit<Category, 'id'>): Promise<Category> {
  const res = await apiClient.post<Category>('/categories', data)
  return res.data
}

export async function updateCategory(id: number, data: Omit<Category, 'id'>): Promise<Category> {
  const res = await apiClient.put<Category>(`/categories/${id}`, data)
  return res.data
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`)
}
