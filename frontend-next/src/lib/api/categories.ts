import type { Category, CategoryType } from '@/types'

import { apiClient } from './client'

/** Con `walletId` se excluyen las categorías ocultas en esa billetera. Sin él
 *  devuelve todas — reportes y presupuestos necesitan el conjunto completo. */
export async function getCategories(type?: CategoryType, walletId?: number): Promise<Category[]> {
  const params: Record<string, string | number> = {}
  if (type) params.type = type
  if (walletId != null) params.walletId = walletId
  const res = await apiClient.get<Category[]>('/categories', {
    params: Object.keys(params).length ? params : undefined,
  })
  return res.data
}

/** Billeteras donde esta categoría está oculta. */
export async function getHiddenIn(categoryId: number): Promise<number[]> {
  const res = await apiClient.get<number[]>(`/categories/${categoryId}/hidden-in`)
  return res.data
}

export async function setCategoryVisibility(
  categoryId: number,
  walletId: number,
  hidden: boolean,
): Promise<void> {
  await apiClient.put(`/categories/${categoryId}/visibility`, { walletId, hidden })
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
