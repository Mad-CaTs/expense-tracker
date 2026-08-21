/**
 * Los 8 acabados de cuero. Fuente única: el picker, el render y el fallback
 * leen de aquí, así añadir una textura es tocar un solo sitio.
 *
 * El orden es el de presentación en el picker: primero los tres originales,
 * después los generados.
 *
 * Los 8 ids deben mantenerse sincronizados con el `@Pattern` de
 * `backend/src/main/java/com/expenses/wallet/internal/WalletRequest.java`:
 * si divergen, la API devuelve 400 al guardar un acabado nuevo.
 */
export const LEATHERS = [
  { id: 'green',    label: 'Verde' },
  { id: 'tan',      label: 'Tan' },
  { id: 'brown',    label: 'Marrón' },
  { id: 'burgundy', label: 'Burdeos' },
  { id: 'navy',     label: 'Azul marino' },
  { id: 'teal',     label: 'Teal' },
  { id: 'plum',     label: 'Ciruela' },
  { id: 'charcoal', label: 'Grafito' },
] as const

export type LeatherId = (typeof LEATHERS)[number]['id']

export const DEFAULT_LEATHER: LeatherId = 'green'

export function leatherSrc(id: LeatherId): string {
  return `/wallets/wallet-${id}.webp`
}

/** La tarjeta metálica que asoma del cuero. Va aquí porque se precarga junto a
 *  los cueros: `LeatherWallet` no se dibuja entero sin ella. */
export const CARD_SRC = '/wallets/card.webp'

/** Valida lo que llega de la API: una billetera anterior a la migración 012
 *  puede traer `leather` vacío o un valor retirado del catálogo. */
export function toLeatherId(value?: string | null): LeatherId {
  return LEATHERS.some((l) => l.id === value) ? (value as LeatherId) : DEFAULT_LEATHER
}
