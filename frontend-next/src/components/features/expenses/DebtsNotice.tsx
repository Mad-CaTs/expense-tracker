'use client'

import { useRouter } from 'next/navigation'

import { useDebtSummary } from '@/lib/hooks/useDebts'
import { useWalletCurrency } from '@/lib/hooks/useWallets'
import { symbolOf } from '@/lib/utils/currency'

const money = (n: number) =>
  n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * Aviso de deudas pendientes bajo las acciones rápidas.
 *
 * <p>Es dinero que va a volver (o a salir) y no aparece en ninguna otra
 * pantalla: sin este recordatorio es justo lo que se olvida cobrar. Se oculta
 * por completo cuando no hay nada pendiente — un cero permanente sería ruido.
 */
export function DebtsNotice() {
  const sym = symbolOf(useWalletCurrency())
  const router = useRouter()
  const { data } = useDebtSummary()

  const theyOwe = data?.theyOwe ?? 0
  const iOwe = data?.iOwe ?? 0
  if (theyOwe <= 0 && iOwe <= 0) return null

  return (
    <button
      type="button"
      onClick={() => router.push('/debts')}
      className="liquid-glass mx-4 mt-3 flex w-[calc(100%-2rem)] cursor-pointer items-center gap-2.5 rounded-[18px] px-4 py-3 text-left transition-transform active:scale-[0.985]"
    >
      {/* Mismo chrome (`liquid-glass-ic`) y mismo glifo Solar que la entrada
          "Deudas" del menú de 3 puntos; el dólar dibujado a mano no pertenecía
          a ninguna de las dos familias. Va en línea y no desde `MenuIcons`
          porque allí el tamaño es fijo (18px) y acá el chip es de 28. */}
      <span className="liquid-glass-ic flex h-[28px] w-[28px] flex-none items-center justify-center rounded-[9px]">
        <svg width="15" height="15" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
          <path fill="currentColor" d="M9.5 12a3.75 3.75 0 1 0 0-7.5a3.75 3.75 0 0 0 0 7.5" />
          <path fill="currentColor" d="M16 12.5a3 3 0 1 0 0-6a3 3 0 0 0 0 6" opacity=".7" />
          <path fill="currentColor" d="M9.5 13.5c-3.314 0-6 1.79-6 4c0 1.105.895 1.5 2 1.5h8c1.105 0 2-.395 2-1.5c0-2.21-2.686-4-6-4" opacity=".5" />
          <path fill="currentColor" d="M16.5 13.75c-.69 0-1.34.09-1.93.25c1.24.86 2.03 2.07 2.03 3.5c0 .35-.06.69-.17 1H19c1.105 0 2-.395 2-1.5c0-1.79-2.015-3.25-4.5-3.25" opacity=".4" />
        </svg>
      </span>

      <span className="flex-1 text-[12.5px]" style={{ color: 'var(--text-secondary)' }}>
        {theyOwe > 0 && (
          <>
            Te deben <b style={{ color: 'var(--text-primary)' }}>{sym} {money(theyOwe)}</b>
          </>
        )}
        {theyOwe > 0 && iOwe > 0 && ' · '}
        {iOwe > 0 && (
          <>
            Debes <b style={{ color: 'var(--text-primary)' }}>{sym} {money(iOwe)}</b>
          </>
        )}
      </span>

      <span className="flex-none text-[11px] font-extrabold" style={{ color: 'var(--text-tertiary)' }}>
        Ver ›
      </span>
    </button>
  )
}
