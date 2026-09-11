'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'

import { categorySwatch } from '@/lib/utils/cardVisuals'
import { useWalletCurrency } from '@/lib/hooks/useWallets'
import { symbolOf } from '@/lib/utils/currency'
import { EASE, MOTION_S } from '@/lib/utils/motion'
import type { Debt } from '@/types'

import { DebtPaymentHistory } from './DebtPaymentHistory'
import { debtHue } from './debtHue'

const money = (n: number) =>
  n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const SHORT_DATE = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' })

interface DebtSettledRowProps {
  debt: Debt
  /** Posición en la lista: alimenta el stagger de `enter-pop`. */
  index: number
  personName: string
  iOwe: boolean
}

/**
 * Una deuda ya saldada, como fila suelta.
 *
 * <p>No se agrupa por persona a propósito: lo pendiente se agrupa porque se
 * cobra a la PERSONA, pero lo saldado es un historial y cada devolución es un
 * hecho con su fecha. Agruparlas obligaba además a mostrar un "S/ 0" por
 * persona, que no dice nada — acá el importe es lo que te devolvieron.
 */
export function DebtSettledRow({ debt, personName, index, iOwe }: DebtSettledRowProps) {
  const tint = debtHue(personName)
  const sym = symbolOf(useWalletCurrency(debt.walletId))
  const day = debt.settledOn ?? debt.incurredOn
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div
      className="enter-pop mx-4 mb-[7px] rounded-[16px] px-[15px] py-[11px]"
      style={{ background: 'var(--bg-subtle)', ['--enter-i' as string]: index }}
    >
      <button
        type="button"
        onClick={() => setShowHistory((v) => !v)}
        aria-expanded={showHistory}
        className="flex w-full cursor-pointer items-center gap-3 text-left"
      >
        <span
          className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full text-[12px] font-extrabold"
          style={{ background: categorySwatch(tint), color: '#fff', opacity: 0.75 }}
        >
          {personName.charAt(0).toUpperCase()}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-bold" style={{ color: 'var(--text-secondary)' }}>
            {personName}
          </span>
          <span className="mt-0.5 block truncate text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {debt.description || 'Préstamo'} · {SHORT_DATE.format(new Date(`${day}T12:00:00`))}
          </span>
        </span>

        {/* El importe devuelto, no un "S/ 0": es el dato con valor de un saldado. */}
        <span className="mono-amount flex-none text-[13px] font-bold tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
          {sym} {money(debt.amount)}
        </span>

        <Check size={14} strokeWidth={2.5} className="flex-none" style={{ color: 'var(--text-muted)' }} />
      </button>

      {/* También en las saldadas: una deuda que se pagó en tres veces es justo
          donde más importa ver cuándo entró cada parte. */}
      <AnimatePresence initial={false}>
        {showHistory && (
          <motion.div
            key="abonos"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: MOTION_S.layer, ease: EASE }}
            className="overflow-hidden"
          >
            <DebtPaymentHistory debtId={debt.id} pending={0} iOwe={iOwe} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
