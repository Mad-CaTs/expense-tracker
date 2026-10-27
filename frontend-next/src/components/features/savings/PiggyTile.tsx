import { categoryAura } from '@/lib/utils/cardVisuals'

import { PiggyIcon } from './PiggyIcon'

interface PiggyTileProps {
  /** Color de la billetera: la baldosa lleva SU aurora, la de la tarjeta. */
  walletColor?: string | null
}

/** El mismo respaldo que usa la tarjeta (WalletHeaderCard) para una billetera sin color. */
const DEFAULT_WALLET_COLOR = '#d4af37'
const TILE_SIZE = 40
const ICON_SIZE = 21

/**
 * La alcancía en una baldosa con la aurora COMPLETA de su billetera: fondo
 * oscuro y las cuatro manchas, como una tarjeta en miniatura.
 *
 * Para las filas de la lista. A ese tamaño el resplandor (`PiggyHalo`) era una
 * niebla: con una billetera gris o negra sus tonos claros se sumaban hasta
 * casi blanco y la alcancía blanca desaparecía. Con el fondo oscuro y las
 * manchas oscuras, el blanco se lee sobre cualquier color —por eso funciona
 * el texto de la tarjeta—.
 */
export function PiggyTile({ walletColor }: PiggyTileProps) {
  const aura = categoryAura(walletColor ?? DEFAULT_WALLET_COLOR)
  return (
    <span
      className="relative flex flex-none items-center justify-center overflow-hidden rounded-[12px]"
      style={{ width: TILE_SIZE, height: TILE_SIZE, background: aura.base }}
    >
      <span className="wallet-aura aura-mini" aria-hidden>
        {aura.blobs.map((color, i) => (
          <span key={i} className={`wallet-blob b${i + 1}`} style={{ background: color }} />
        ))}
      </span>
      <span className="relative z-[1]" style={{ color: '#fff' }}>
        <PiggyIcon size={ICON_SIZE} />
      </span>
    </span>
  )
}
