'use client'

import { AnimatedAmount } from '@/components/features/shared/AnimatedAmount'
import { WalletChip } from '@/components/features/reports/WalletChip'
import type { Wallet } from '@/types'

interface WalletScopeCardProps {
  wallets: Wallet[]
  walletId: number
}

/**
 * Encabezado de /reports: de qué billetera son las cifras que se están viendo.
 *
 * Solo informa; no deja cambiar de billetera. Esa elección se hace en /wallets,
 * la portada, y se arrastra por toda la app — un segundo selector acá permitía
 * salirse de esa billetera sin que la pantalla anterior se enterara.
 */
export function WalletScopeCard({ wallets, walletId }: WalletScopeCardProps) {
  const active = wallets.find((w) => w.id === walletId) ?? wallets[0]
  if (!active) return null

  return (
    <div className="mx-4 mb-[18px]">
      {/* Sin caja: el saldo es la tipografía y la billetera un rótulo encima.
          El bloque de color a todo ancho que había antes era la pieza más
          pesada de la pantalla pero solo daba contexto, y competía con Gastos e
          Ingresos, que sí son el contenido. El color se conserva donde
          identifica: la mini-tarjeta. */}
      <div className="flex items-center gap-2.5">
        <WalletChip color={active.color} width={34} />
        <span
          className="min-w-0 truncate text-[11px] font-extrabold uppercase tracking-[0.12em]"
          style={{ color: 'var(--text-muted)' }}
        >
          {active.name}
        </span>
      </div>

      {/* Cuenta al cambiar de billetera en vez de saltar: el recorrido dice si
          el saldo sube o baja respecto al que se estaba mirando, y es lo que ya
          hacen las cifras del resto de la app. */}
      <p
        className="mono-amount mt-1 text-[32px] font-extrabold leading-[1.05] tracking-[-0.035em] tabular-nums"
        style={{ color: 'var(--text-primary)' }}
      >
        S/ <AnimatedAmount value={Number(active.balance)} />
      </p>
      <p className="mt-1 text-[11.5px]" style={{ color: 'var(--text-muted)' }}>
        Saldo disponible
      </p>
    </div>
  )
}
