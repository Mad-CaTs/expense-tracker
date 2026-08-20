'use client'

import { useCountUp } from '@/components/features/shared/useCountUp'

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
  const shown = useCountUp(value, animateOnMount, from)

  return (
    <span className={className} style={style}>
      {shown.toLocaleString('es-PE', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      })}
    </span>
  )
}
