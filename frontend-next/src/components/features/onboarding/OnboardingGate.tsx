'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { useWallets } from '@/lib/hooks/useWallets'

/** El onboarding vive acá; desde dentro no puede redirigirse a sí mismo. */
const WELCOME = '/welcome'

/**
 * Manda a una cuenta sin billeteras a crear la primera.
 *
 * La condición es `wallets.length === 0` y no un flag de "usuario nuevo": ese es
 * el estado que de verdad importa —sin billetera no se registra ningún
 * movimiento— y además viaja con la cuenta, así que entrar desde otro
 * dispositivo no vuelve a mostrar el onboarding a quien ya lo completó, ni lo
 * oculta a quien no.
 *
 * Espera a que la consulta resuelva: mientras carga, `data` es `undefined` y
 * tratarlo como "sin billeteras" mandaría al onboarding a todo el mundo en cada
 * recarga.
 */
export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: wallets, isSuccess } = useWallets()

  const onWelcome = pathname === WELCOME
  const empty = isSuccess && wallets.length === 0

  const needsOnboarding = empty && !onWelcome
  const alreadyDone = isSuccess && wallets.length > 0 && onWelcome

  useEffect(() => {
    if (needsOnboarding) router.replace(WELCOME)
    else if (alreadyDone) router.replace('/expenses')
  }, [needsOnboarding, alreadyDone, router])

  if (needsOnboarding || alreadyDone) return null

  return <>{children}</>
}
