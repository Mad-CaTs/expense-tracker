import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api`,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

let redirecting = false
let refreshing: Promise<string> | null = null

function logout() {
  if (redirecting || typeof window === 'undefined') return
  redirecting = true
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_refresh')
  localStorage.removeItem('auth_must_change')
  window.location.replace('/login')
}

async function renew(): Promise<string> {
  const refreshToken = localStorage.getItem('auth_refresh')
  if (!refreshToken) throw new Error('sin refresh token')

  const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  )

  localStorage.setItem('auth_token', data.accessToken)
  localStorage.setItem('auth_refresh', data.refreshToken)
  return data.accessToken
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
    const status = error.response?.status
    const isAuthEndpoint = config?.url?.includes('/auth/')

    if (status === 401 && config && !config._retried && !isAuthEndpoint && typeof window !== 'undefined') {
      config._retried = true
      try {
        refreshing = refreshing ?? renew().finally(() => { refreshing = null })
        const token = await refreshing
        config.headers.Authorization = `Bearer ${token}`
        return apiClient(config)
      } catch {
        logout()
        return Promise.reject(error)
      }
    }

    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      logout()
    }
    return Promise.reject(error)
  },
)