import type { LoginRequest, LoginResponse } from '@/types'

import { apiClient } from './client'

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/auth/login', data)
  return res.data
}

export async function changePassword(data: ChangePasswordRequest): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>('/auth/change-password', data)
  return res.data
}

export async function completeOnboarding(): Promise<void> {
  await apiClient.post('/auth/complete-onboarding')
}
