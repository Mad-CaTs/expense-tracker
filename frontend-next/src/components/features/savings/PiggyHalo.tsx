import { categoryAura } from '@/lib/utils/cardVisuals'

import { PiggyIcon } from './PiggyIcon'

interface PiggyHaloProps {
  /** Color de la billetera: la alcancía lleva SU aurora, la misma de la tarjeta. */
  walletColor?: string | null
  /** Lado del resplandor; la alcancía va al centro a `iconSize`. */
  size?: number
  iconSize?: number
  className?: string
}

/** El mismo respaldo que usa la tarjeta (WalletHeaderCard) para una billetera sin color. */
const DEFAULT_WALLET_COLOR = '#d4af37'

/* Se desvanece hacia afuera sin borde: un círculo recortado se leía como un
   botón o un avatar, no como un resplandor. */
const FADE = 'radial-gradient(circle, #000 28%, transparent 68%)'

/**
 * La alcancía sobre un resplandor con la aurora en movimiento de su billetera.
 * Reusa las clases de la tarjeta (`wallet-aura`/`wallet-blob`), así que se
 * congela con `is-sliding` mientras la hoja se desliza.
 */
export function PiggyHalo({ walletColor, size = 120, iconSize = 40, className = '' }: PiggyHaloProps) {
  const { blobs } = categoryAura(walletColor ?? DEFAULT_WALLET_COLOR)
  /* Solo los tonos CLAROS (foco y halo). La penumbra y la sombra dan
     profundidad sobre el fondo de la tarjeta; sin ese fondo, con blend
     `screen`, no aportan luz y el resplandor quedaba tuerto. */
  const [, focus, halo] = blobs
  const lights = [focus, halo, focus, halo]

  return (
    <span className={`relative flex flex-none items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage: FADE,
          WebkitMaskImage: FADE,
          // Brillo base centrado: las manchas viajan, y sin él había instantes
          // en que el centro —donde está la alcancía— quedaba apagado.
          background: `radial-gradient(circle, color-mix(in srgb, ${focus} 40%, transparent) 0%, transparent 60%)`,
        }}
        aria-hidden
      >
        <span className="wallet-aura aura-mini">
          {lights.map((color, i) => (
            <span key={i} className={`wallet-blob b${i + 1}`} style={{ background: color }} />
          ))}
        </span>
      </span>
      <span className="relative z-[1]" style={{ color: '#fff' }}>
        <PiggyIcon size={iconSize} />
      </span>
    </span>
  )
}
