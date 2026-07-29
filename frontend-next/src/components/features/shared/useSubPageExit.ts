'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { MOTION } from '@/lib/utils/motion'

/**
 * Navegación entre una lista y su detalle con salida visible.
 *
 * `router.push` cambia de pantalla en el acto: sin esto la vista actual
 * desaparece de golpe y solo se ve la entrada de la siguiente. Acá se marca la
 * salida, se espera a que corra y recién entonces se navega.
 *
 * El gesto es el de `.enter-pop` —el mismo de la tarjeta de categoría— para que
 * la pantalla entre y salga como la tarjeta que la abrió.
 */
export function useSubPageExit() {
  const router = useRouter()
  const [leaving, setLeaving] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
  }, [])

  const navigate = useCallback((to: string | null) => {
    if (timer.current !== null) return
    setLeaving(true)
    timer.current = window.setTimeout(() => {
      timer.current = null
      if (to === null) router.back()
      else router.push(to)
    }, MOTION.layer)
  }, [router])

  return {
    /** Clase de salida para el contenedor; vacía mientras no se navega. */
    exitClass: leaving ? 'subpage-out' : '',
    /** Avanza a un detalle. */
    open: useCallback((to: string) => navigate(to), [navigate]),
    /** Vuelve a la pantalla anterior. */
    goBack: useCallback(() => navigate(null), [navigate]),
  }
}
