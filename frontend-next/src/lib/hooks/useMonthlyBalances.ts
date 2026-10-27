'use client'

import { useQuery } from '@tanstack/react-query'

import { getMonthlyBalances } from '@/lib/api/wallets'

/** Evolución del saldo de una billetera, mes a mes, dentro del rango. */
export function useMonthlyBalances(walletId: number | undefined, from: string, to: string) {
  return useQuery({
    queryKey: ['wallets', walletId ?? null, 'monthly-balances', from, to],
    queryFn: () => getMonthlyBalances(walletId as number, from, to),
    enabled: walletId != null,
  })
}
