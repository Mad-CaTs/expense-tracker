import axios from 'axios'

export const apiClient = axios.create({
  // Vacío → '/api' relativo (mismo origen) y Next hace de proxy al backend.
  // Funciona en desktop y en móvil/ngrok sin CORS ni problemas de loopback.
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

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/')
    if (error.response?.status === 401 && !isAuthEndpoint && typeof window !== 'undefined' && !redirecting) {
      redirecting = true
      localStorage.removeItem('auth_token')
      window.location.replace('/login')
    }
    return Promise.reject(error)
  }
)
