'use client'

import { useEffect, useRef, useState } from 'react'

import { animate } from 'framer-motion'

import { EASE, MOTION } from '@/lib/utils/motion'

export function useCountUp(value: number, animateOnMount = false, from = 0): number {
  const [shown, setShown] = useState(animateOnMount ? from : value)
  const previous = useRef(animateOnMount ? from : value)
  const mounted = useRef(false)

  useEffect(() => {
    const first = !mounted.current
    mounted.current = true
    if (first && !animateOnMount) {
      previous.current = value
      setShown(value)
      return
    }
    if (previous.current === value) return

    const controls = animate(previous.current, value, {
      duration: MOTION.count / 1000,
      ease: EASE,
      onUpdate: setShown,
    })
    previous.current = value

    /* Al cortar el conteo —desmontaje, o el doble efecto de Strict Mode— hay que
       dejar la cifra PUESTA en su destino. `stop()` la congela donde iba, y si
       se corta en el primer frame se queda en el origen: por eso el saldo se
       veía en 0 aunque el dato ya había llegado. */
    return () => {
      controls.stop()
      setShown(value)
    }
  }, [value])

  return shown
}
