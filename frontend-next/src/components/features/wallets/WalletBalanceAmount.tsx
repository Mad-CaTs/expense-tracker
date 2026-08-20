'use client'

import { AnimatedAmount } from '@/components/features/shared/AnimatedAmount'

interface WalletBalanceAmountProps {
  /** Billetera a la que pertenece el saldo. */
  walletId: number
  balance: number
  className?: string
  style?: React.CSSProperties
}

/**
 * Saldo de la billetera activa, que RECORRE hasta su nuevo valor igual que los
 * resúmenes de frecuentes y categorías: al registrar un gasto, un ingreso o una
 * transferencia el cambio se ve moverse en vez de aparecer ya cambiado.
 *
 * La `key` por billetera es lo que hace que solo cuente cuando corresponde: al
 * deslizar el carrusel el número también cambia, pero ahí son dos saldos
 * distintos e interpolar entre ellos inventaría cifras intermedias que nunca
 * existieron. Remontando el contador, ese valor aparece puesto; el conteo queda
 * reservado para cuando cambia el saldo de la billetera que ya estás viendo.
 */
export function WalletBalanceAmount({ walletId, balance, className, style }: WalletBalanceAmountProps) {
  return <AnimatedAmount key={walletId} value={balance} className={className} style={style} />
}
