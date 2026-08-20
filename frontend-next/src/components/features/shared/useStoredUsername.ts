'use client'

import { useSyncExternalStore } from 'react'

const KEY = 'auth_username'

/**
 * El usuario de la sesión, leído sin romper la hidratación.
 *
 * Leerlo con `useState(() => localStorage.getItem(...))` parecía inofensivo,
 * pero en el servidor no hay localStorage: el HTML salía con el placeholder
 * ("?") y el cliente montaba la inicial real ("P"). React ve dos árboles
 * distintos, aborta la hidratación y la regenera entera — con el error rojo en
 * desarrollo. Solo se notaba al RECARGAR con sesión activa; navegando desde el
 * login no, porque ahí no hay render del servidor de por medio.
 *
 * `useSyncExternalStore` existe para esto: declara el valor del servidor
 * (cadena vacía) por separado del cliente, así ambos coinciden al hidratar y el
 * nombre aparece justo después.
 */
export function useStoredUsername(): string {
  return useSyncExternalStore(subscribe, getSnapshot, () => '')
}

function getSnapshot(): string {
  return localStorage.getItem(KEY) ?? ''
}

/** El nombre no cambia dentro de una sesión: no hay a qué suscribirse. */
function subscribe(): () => void {
  return () => {}
}
