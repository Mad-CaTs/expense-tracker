'use client'

import { cardGradient } from '@/lib/utils/cardVisuals'

/** Mismo archivo que pinta el carrusel de /expenses. */
const LOGO_URL = '/brand/logo.webp'

interface WalletChipProps {
  /** Color de la billetera; sin él se pinta como "todas". */
  color?: string
  /** Ancho en px; el alto sale de la proporción de una tarjeta. */
  width?: number
}

/**
 * La cara de una billetera en miniatura: su degradado y el logo de la app.
 *
 * Reusa `cardGradient` para que la misma billetera se vea igual acá y en el
 * carrusel, y el logo va invertido porque el archivo original es oscuro.
 * Sin `color` queda en cristal neutro: representa "todas", que no es una
 * billetera sino la ausencia de filtro.
 */
export function WalletChip({ color, width = 46 }: WalletChipProps) {
  const height = Math.round(width * 0.65)

  return (
    <span
      className={`relative flex flex-none items-center overflow-hidden rounded-[7px]${color ? '' : ' liquid-glass-ic'}`}
      style={{
        width,
        height,
        paddingLeft: color ? Math.round(width * 0.15) : 0,
        justifyContent: color ? 'flex-start' : 'center',
        background: color ? cardGradient(color) : undefined,
        boxShadow: color ? '0 1px 3px rgba(0,0,0,0.35)' : undefined,
      }}
      aria-hidden
    >
      <span
        style={{
          width: Math.round(width * 0.48),
          height: Math.round(height * 0.4),
          background: `url(${LOGO_URL}) left center / contain no-repeat`,
          filter: 'invert(1)',
          opacity: color ? 0.92 : 0.5,
        }}
      />
    </span>
  )
}
