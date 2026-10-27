'use client'

import { useWallets } from '@/lib/hooks/useWallets'
import { symbolOf } from '@/lib/utils/currency'
import type { Debt } from '@/types'

/**
 * Símbolos de moneda para deudas, que viven cada una en su billetera.
 *
 * Un lookup y no un hook por deuda: las listas varían de largo.
 */
export function useDebtSymbols() {
  const { data: wallets } = useWallets()

  const symOf = (walletId?: number) => symbolOf(wallets?.find((w) => w.id === walletId)?.currency)

  /* Para un TOTAL: solo hay símbolo si todas las deudas comparten moneda.
     Sumar soles con dólares y ponerle "S/" delante sería afirmar algo falso,
     así que mezcladas la cifra va desnuda. */
  const sharedSym = (debts: Debt[]) => {
    const symbols = new Set(debts.map((d) => symOf(d.walletId)))
    return symbols.size === 1 ? [...symbols][0] : ''
  }

  return { symOf, sharedSym }
}
