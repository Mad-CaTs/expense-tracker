'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

import { categorySwatch } from '@/lib/utils/cardVisuals'
import { EASE, MOTION_S } from '@/lib/utils/motion'

import { DebtPaymentHistory } from './DebtPaymentHistory'
import { debtHue } from './debtHue'
import { settledDay, type SettledPerson } from './settledGroups'
import { useDebtSymbols } from './useDebtSymbols'
import { debtLabel } from './debtViews'

const money = (n: number) =>
  n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const SHORT_DATE = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' })
const shortDate = (day: string) => SHORT_DATE.format(new Date(`${day}T12:00:00`))

interface DebtSettledPersonGroupProps {
  person: SettledPerson
  /** Posición en la lista: alimenta el stagger de `enter-pop`. */
  index: number
  iOwe: boolean
}

/**
 * Lo que una persona saldó en un mes, tenga una deuda o varias.
 *
 * Una sola forma para todas las filas, como la tarjeta de Pendientes: la fila
 * resume y al desplegarla aparece cada deuda con sus abonos debajo. Antes una
 * deuda suelta abría sus abonos y un grupo abría sus deudas —el mismo gesto
 * llevaba a niveles distintos según la persona—.
 *
 * El importe es lo que DEVOLVIÓ ese mes, no su saldo: un "S/ 0" no diría nada.
 */
export function DebtSettledPersonGroup({ person, index, iOwe }: DebtSettledPersonGroupProps) {
  const { personName, debts } = person
  const { symOf, sharedSym } = useDebtSymbols()
  const [open, setOpen] = useState(false)
  const sym = sharedSym(debts)
  const total = debts.reduce((acc, d) => acc + d.amount, 0)
  const accent = categorySwatch(debtHue(personName))
  const summary = debts.length === 1
    ? `1 deuda · ${shortDate(settledDay(debts[0]))}`
    : `${debts.length} deudas · última ${shortDate(settledDay(debts[0]))}`

  return (
    <div
      className="enter-pop mx-4 mb-[7px] rounded-[16px] px-[15px] py-[11px]"
      style={{ background: 'var(--bg-subtle)', ['--enter-i' as string]: index }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-3 text-left"
      >
        <span
          className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full text-[12px] font-extrabold"
          style={{ background: accent, color: '#fff', opacity: 0.75 }}
        >
          {personName.charAt(0).toUpperCase()}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-bold" style={{ color: 'var(--text-secondary)' }}>
            {personName}
          </span>
          <span className="mt-0.5 block truncate text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {summary}
          </span>
        </span>

        <span className="amount-figure flex-none text-[13px] font-bold tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
          {sym && `${sym} `}{money(total)}
        </span>

        <ChevronDown
          size={14}
          className="flex-none transition-transform duration-200"
          style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detalle"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: MOTION_S.layer, ease: EASE }}
            className="overflow-hidden"
          >
            {/* Una tarjeta por deuda, con la franja del color de la persona: en
                una sola caja con separadores finos, dónde acababa una deuda y
                empezaba la siguiente no se distinguía. */}
            <div className="mt-2 flex flex-col gap-1.5">
              {debts.map((d) => (
                <div
                  key={d.id}
                  className="rounded-[12px] px-3 py-2.5"
                  style={{ background: 'var(--bg-hover)', borderLeft: `3px solid ${accent}` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {debtLabel(d)}
                      </span>
                      <span className="mt-px block truncate text-[10.5px]" style={{ color: 'var(--text-muted)' }}>
                        Saldada el {shortDate(settledDay(d))}
                      </span>
                    </span>
                    <span className="amount-figure flex-none text-[12.5px] font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      {symOf(d.walletId)} {money(d.amount)}
                    </span>
                  </div>

                  {/* Los abonos siempre a la vista bajo su deuda: un nivel
                      más que abrir era justo lo que la hacía distinta. */}
                  <DebtPaymentHistory debtId={d.id} pending={0} iOwe={iOwe} bare />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
