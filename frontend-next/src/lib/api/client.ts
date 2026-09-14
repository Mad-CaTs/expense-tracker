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
        /* UNA sola renovación compartida por todas las peticiones que fallen a
           la vez. El backend rota el refresh token y revoca la familia entera
           si detecta reuso, así que dos renovaciones en paralelo con el mismo
           token cierran la sesión — que es justo lo que pasaba al abrir la app,
           cuando /wallets y /categories salen juntas con el JWT ya vencido.

           El `.finally(() => refreshing = null)` de antes era el fallo: se
           ejecuta ANTES de que los `await` encadenados reciban el valor, así
           que la siguiente petición encontraba `refreshing` ya en null y
           lanzaba una segunda renovación. Ahora se limpia en el siguiente tick,
           cuando todos los que esperaban ya han resuelto. */
        if (!refreshing) {
          refreshing = renew()
          void refreshing
            .catch(() => {})
            .then(() => { setTimeout(() => { refreshing = null }, 0) })
        }
        const token = await refreshing
        config.headers.Authorization = `Bearer ${token}`
        return apiClient(config)
      } catch {
        logout()
        return Promise.reject(error)
      }
    }

    /* Solo 401 (no autenticado) cierra sesión. Un 403 es "estás identificado
       pero esto no te corresponde": echar al usuario por eso lo saca de una
       sesión perfectamente válida. Además el 401 aquí ya viene de una petición
       reintentada —o del propio refresh fallido—, porque el bloque de arriba
       se queda con el primer intento. */
    if (status === 401 && !isAuthEndpoint) {
      logout()
    }
    return Promise.reject(error)
  },
)