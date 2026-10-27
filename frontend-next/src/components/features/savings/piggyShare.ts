export interface PiggyShare {
  /** Porcentajes enteros que suman 100 (o 0 si no hay nada). */
  piggy: number
  others: number
  available: number
}

const PERCENT = 100

/** Un tono de verde por alcancía (máx. 4): las distingue en la barra de la
 *  lista y en el punto de su fila, que hace de leyenda. */
export const PIGGY_TONES = [
  'var(--success)',
  'color-mix(in srgb, var(--success) 55%, white)',
  'color-mix(in srgb, var(--success) 65%, black)',
  'color-mix(in srgb, var(--success) 28%, white)',
] as const

/** "0%" con dinero adentro se lee como vacía: lo que no llega a 1% se dice así. */
export const percentLabel = (pct: number) => (pct > 0 && pct < 1 ? '<1%' : `${Math.round(pct)}%`)

/** Peso de un monto sobre lo que hay en la billetera (apartado + disponible),
 *  en %. Disponible negativo cuenta como cero, igual que en `piggyShare`. */
export function shareOfWallet(amount: number, saved: number, available: number): number {
  const total = saved + Math.max(0, available)
  return total > 0 ? (amount / total) * PERCENT : 0
}

/**
 * Qué parte de lo que hay en la billetera está en esta alcancía, en las demás
 * y disponible.
 *
 * Un disponible negativo (la app lo permite) cuenta como cero: no hay "parte"
 * negativa que dibujar. El disponible se calcula como resto para que los tres
 * redondeos sumen exactamente 100.
 */
export function piggyShare(piggy: number, others: number, available: number): PiggyShare {
  const free = Math.max(0, available)
  const total = piggy + others + free
  if (total <= 0) return { piggy: 0, others: 0, available: 0 }

  const piggyPct = Math.round((piggy / total) * PERCENT)
  const othersPct = Math.round((others / total) * PERCENT)
  return { piggy: piggyPct, others: othersPct, available: Math.max(0, PERCENT - piggyPct - othersPct) }
}
