/**
 * Moneda por billetera.
 *
 * Solo cambia el SÍMBOLO y el formato: no hay conversión ni tipos de cambio.
 * Cada billetera muestra sus importes en su moneda, y los totales que mezclan
 * varias se presentan separados por moneda en vez de sumarse — sumar soles con
 * dólares daría una cifra que no significa nada.
 */
export const CURRENCIES = [
  { id: 'PEN', symbol: 'S/', label: 'Soles' },
  { id: 'USD', symbol: '$', label: 'Dólares' },
  { id: 'EUR', symbol: '€', label: 'Euros' },
] as const

export type CurrencyId = (typeof CURRENCIES)[number]['id']

export const DEFAULT_CURRENCY: CurrencyId = 'PEN'

/** Símbolo de una moneda. Cae en soles ante un valor desconocido o ausente:
 *  es lo que la app mostraba antes de que la moneda fuese configurable. */
export function symbolOf(currency?: string | null): string {
  return CURRENCIES.find((c) => c.id === currency)?.symbol ?? 'S/'
}

/** Importe con su símbolo, en el formato de la app (dos decimales). */
export function formatMoney(amount: number, currency?: string | null, decimals = 2): string {
  const n = amount.toLocaleString('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `${symbolOf(currency)} ${n}`
}

/** La siguiente moneda del ciclo PEN → USD → EUR → PEN.
 *  El selector del formulario avanza con ella en cada toque. */
export function nextCurrency(current?: string | null): CurrencyId {
  const i = CURRENCIES.findIndex((c) => c.id === current)
  return CURRENCIES[(i + 1) % CURRENCIES.length].id
}
