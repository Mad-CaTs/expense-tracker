'use client'

import { ChevronRight, Plus } from 'lucide-react'

import { AnimatedAmount } from '@/components/features/shared/AnimatedAmount'
import { formatMoney, symbolOf } from '@/lib/utils/currency'
import type { PiggyBank, Wallet } from '@/types'

import { PiggyTile } from './PiggyTile'
import { PIGGY_TONES, shareOfWallet } from './piggyShare'
import { savedTotal } from './savedTotal'

/** Espejo de `PiggyBankService.MAX_PER_WALLET`: el servidor también lo valida. */
export const MAX_PIGGIES_PER_WALLET = 4

interface PiggyListProps {
  piggies: PiggyBank[]
  wallet: Wallet
  onOpen: (id: number) => void
  onCreate: () => void
}

/** Total apartado y una barra con cada alcancía y el disponible. Sin leyenda:
 *  el punto de color de cada fila hace de leyenda. */
function Summary({ piggies, wallet }: { piggies: PiggyBank[]; wallet: Wallet }) {
  const saved = savedTotal(piggies)
  const available = Number(wallet.balance)
  return (
    <div className="mb-4">
      <p className="text-[30px] font-bold leading-none tracking-[-0.03em] tabular-nums" style={{ color: 'var(--text-primary)' }}>
        {/* Como el saldo de la tarjeta: símbolo y cifra en la misma letra y tamaño. */}
        {symbolOf(wallet.currency)} <AnimatedAmount value={saved} />
      </p>
      <div className="mt-3 flex h-2 gap-[2px] overflow-hidden rounded-full" style={{ background: 'var(--bg-hover)' }}>
        {piggies.map((p, i) => (
          <span
            key={p.id}
            className="block h-full"
            style={{
              width: `${shareOfWallet(Number(p.balance), saved, available)}%`,
              background: PIGGY_TONES[i % PIGGY_TONES.length],
              transition: 'width var(--dur-travel) var(--ease-sys)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function PiggyList({ piggies, wallet, onOpen, onCreate }: PiggyListProps) {
  const full = piggies.length >= MAX_PIGGIES_PER_WALLET

  return (
    <div className="px-4 pb-5 pt-2">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[16.5px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>Alcancías</p>
        {/* Avisa del tope ANTES de llegar a él. */}
        {piggies.length > 0 && (
          <span className="text-[11.5px] font-bold" style={{ color: 'var(--text-muted)' }}>
            {piggies.length} de {MAX_PIGGIES_PER_WALLET}
          </span>
        )}
      </div>

      {piggies.length === 0 ? (
        <p className="px-2 pb-4 pt-1 text-center text-[12.5px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Aparta dinero para tus metas. Lo sacas cuando quieras.
        </p>
      ) : (
        <Summary piggies={piggies} wallet={wallet} />
      )}

      <div className="flex flex-col gap-[7px]">
        {piggies.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpen(p.id)}
            className="liquid-glass flex w-full cursor-pointer items-center gap-3 rounded-[18px] py-2.5 pl-2.5 pr-3 text-left transition-transform active:scale-[0.99]"
          >
            <PiggyTile walletColor={wallet.color} />
            <span className="min-w-0 flex-1 truncate text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>
              {p.name}
            </span>
            <span className="flex-none text-[14px] font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {formatMoney(p.balance, wallet.currency)}
            </span>
            <ChevronRight size={15} className="flex-none" style={{ color: 'var(--text-muted)' }} />
          </button>
        ))}
      </div>

      {full ? (
        <p className="mt-4 text-center text-[11.5px]" style={{ color: 'var(--text-muted)' }}>
          Llegaste al máximo de {MAX_PIGGIES_PER_WALLET} alcancías en esta billetera.
        </p>
      ) : (
        <button
          type="button"
          onClick={onCreate}
          className="liquid-glass-ic mt-3 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full text-[13.5px] font-bold transition-transform active:scale-[0.98]"
          style={{ color: 'var(--text-primary)' }}
        >
          <Plus size={16} strokeWidth={2.4} />
          Nueva alcancía
        </button>
      )}
    </div>
  )
}
