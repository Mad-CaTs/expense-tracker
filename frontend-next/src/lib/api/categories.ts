import type { Category } from '@/types'

import { apiClient } from './client'

export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get<Category[]>('/categories')
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
