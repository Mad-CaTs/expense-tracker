'use client'

import { useSyncExternalStore } from 'react'

/**
 * Espejo local de `users.onboarding_completed_at`.
 *
 * La fuente de verdad es el backend —lo manda en el login—, pero el guard
 * necesita decidir en el primer render, antes de cualquier petición. Acá se
 * guarda lo que dijo el login para poder leerlo de forma síncrona.
 */
export const ONBOARDING_DONE_KEY = 'pockr-onboarding-done'

/** Si el usuario ya pasó por el onboarding alguna vez. */
export function hasSeenOnboarding(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(ONBOARDING_DONE_KEY) === 'true'
}

/**
 * La misma marca, para leer desde un componente.
 *
 * `useSyncExternalStore` y no un efecto con setState: localStorage no existe en
 * el servidor, y sembrar el estado con él hacía que servidor y cliente
 * renderizaran árboles distintos —React abortaba la hidratación. Esta API está
 * hecha para justamente esto: el snapshot del servidor es explícito (`false`)
 * y el del cliente se lee tras hidratar, sin desajuste.
 */
export function useHasSeenOnboarding(): boolean {
  return useSyncExternalStore(subscribe, hasSeenOnboarding, () => false)
}

/** No cambia mientras la pantalla vive: nadie más escribe esta clave. */
function subscribe(): () => void {
  return () => {}
}

/** Lo marca localmente; el backend se entera por `completeOnboarding()`. */
export function markOnboardingSeen(): void {
  localStorage.setItem(ONBOARDING_DONE_KEY, 'true')
}
