'use client'

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ThemeProvider } from './ThemeProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            /* 3 minutos, no 30 segundos. Con 30s casi cualquier vuelta a la
               pestaña —cambiar de app en el móvil, desbloquear— relanzaba TODAS
               las consultas activas a la vez: es lo que llenaba la pestaña de
               red con peticiones repetidas de `by-category` y `daily`.

               No retrasa lo que el usuario acaba de hacer: los hooks de
               mutación invalidan su caché en `onSuccess`, así que registrar,
               editar o borrar refresca al instante. Esto solo gobierna los
               refrescos AUTOMÁTICOS. */
            staleTime: 180_000,
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      })
  )
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  )
}
