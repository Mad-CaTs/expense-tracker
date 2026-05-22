import type { LoginRequest, LoginResponse } from '@/types'

import { apiClient } from './client'

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/auth/login', data)
  return res.data
}
