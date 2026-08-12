'use client'

import { useEffect, useRef, useState } from 'react'

import { animate } from 'framer-motion'

import { MOTION } from '@/lib/utils/motion'

export interface AnimatedAmountProps {
  value: number
  /** Decimales a mostrar. Los montos usan 2; los contadores, 0. */
  fractionDigits?: number
  /** Anima también la primera vez, contando desde `from` (0 por defecto). */
  animateOnMount?: boolean
  from?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * Número que RECORRE hasta su nuevo valor en vez de saltar.
 *
 * Cuando un resumen se recalcula —al pausar un frecuente, confirmar una
 * ocurrencia o crear algo— el cambio de cifra sin transición se lee como un
 * parpadeo, y no queda claro si subió o bajó. Interpolando, el movimiento mismo
 * comunica la dirección.
 *
 * Con `animateOnMount` cuenta también la primera vez. Sirve donde el elemento
 * aparece tras un skeleton —el dato llega y el conteo acompaña esa llegada—;
 * sin él, el valor se muestra puesto desde el arranque.
 */
export function AnimatedAmount({
  value,
  fractionDigits = 2,
  animateOnMount = false,
  from = 0,
  className,
  style,
}: AnimatedAmountProps) {
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
      ease: [0.32, 0.72, 0, 1],
      onUpdate: setShown,
    })
    previous.current = value
    return () => controls.stop()
    // `animateOnMount` y `from` solo importan en el primer render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <span className={className} style={style}>
      {shown.toLocaleString('es-PE', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      })}
    </span>
  )
}
