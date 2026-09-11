'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'

import { nextCurrency, symbolOf, type CurrencyId } from '@/lib/utils/currency'

interface CurrencySignButtonProps {
  value: CurrencyId
  onChange: (id: CurrencyId) => void
  /** true cuando la billetera ya tiene movimientos: el signo se muestra pero
   *  no se toca ni late. */
  locked?: boolean
  /** Tamaño del glifo. El formulario y el onboarding usan el de por defecto. */
  size?: number
}

/**
 * El signo del saldo ES el selector de moneda.
 *
 * <p>Cada toque avanza PEN → USD → EUR. No hay lista ni sheet: son tres
 * opciones y el sitio donde la moneda importa es justo delante del importe, así
 * que el propio símbolo hace de control.
 *
 * <p>Se pinta como el signo de los demás heroes de la app (`<small>` en la
 * fuente de texto, `--text-tertiary`, junto a la cifra): sin caja, borde ni
 * fondo, que lo convertirían en un widget ajeno al lenguaje de la app.
 *
 * <p>Que se toca lo dice un halo que late despacio alrededor del glifo, con
 * el mismo planteamiento que el tirador de la tarjeta en Finanzas
 * (`.xp-swipe-hint`): ciclo largo, casi siempre quieto, y sin icono nuevo.
 * Se apaga en cuanto el usuario toca una vez — ya no hace falta, y dejarlo
 * latiendo junto al campo del saldo sería ruido permanente.
 *
 * <p>Cambiar la moneda NO convierte nada: REINTERPRETA lo ya registrado, así
 * que en cuanto la billetera tiene un movimiento queda fijada (`locked`) y el
 * signo pasa a ser un rótulo: ni pulso, ni toque, ni foco de teclado. Se sigue
 * mostrando porque la moneda es información aunque no se pueda cambiar.
 */
export function CurrencySignButton({ value, onChange, size = 23, locked = false }: CurrencySignButtonProps) {
  const [used, setUsed] = useState(false)
  const interactive = !locked

  return (
    <motion.button
      type="button"
      onClick={() => { if (!interactive) return; setUsed(true); onChange(nextCurrency(value)) }}
      whileTap={interactive ? { scale: 0.88 } : undefined}
      disabled={locked}
      // Fuera del tabulador cuando está fijada: un botón que no hace nada no
      // debe robar foco ni anunciarse como pulsable.
      tabIndex={locked ? -1 : undefined}
      aria-label={locked
        ? `Moneda: ${value}. No se puede cambiar: la billetera ya tiene movimientos`
        : `Moneda: ${value}. Toca para cambiar`}
      className={`border-0 bg-transparent p-0 leading-none${interactive ? ' cursor-pointer' : ''}${interactive && !used ? ' cur-tap-hint' : ''}`}
    >
      {/* `key` en el glifo: al cambiar, React lo remonta y la entrada se
          vuelve a disparar en cada toque. */}
      <motion.small
        key={value}
        initial={{ opacity: 0, y: 9 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 26 }}
        className="block font-bold leading-none"
        style={{ fontSize: size, color: 'var(--text-tertiary)' }}
      >
        {symbolOf(value)}
      </motion.small>
    </motion.button>
  )
}
