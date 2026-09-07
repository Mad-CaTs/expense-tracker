'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

import { categorySwatch } from '@/lib/utils/cardVisuals'
import { EASE, MOTION_S } from '@/lib/utils/motion'
import type { Debt, DebtPersonGroup } from '@/types'

import { DebtPaymentHistory } from './DebtPaymentHistory'
import { DebtPaymentsPrefetch } from './DebtPaymentsPrefetch'
import { debtHue } from './debtHue'

const money = (n: number) =>
  n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

const SHORT_DATE = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' })

interface DebtPersonCardProps {
  group: DebtPersonGroup
  iOwe: boolean
  open: boolean
  onToggle: () => void
  onCollect: (debt: Debt) => void
}

export function DebtPersonCard({ group, iOwe, open, onToggle, onCollect }: DebtPersonCardProps) {
  const tint = debtHue(group.personName)
  const count = group.debts.length
  /* Los abonos se piden solo al abrir su historial: la mayoría de deudas se
     cobran de una vez y no tienen nada que mostrar. */
  const [openHistory, setOpenHistory] = useState<number | null>(null)

  return (
    <div className="mx-4 mb-[7px]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="liquid-glass flex w-full cursor-pointer items-center gap-3 rounded-[16px] px-[15px] py-3 text-left transition-transform active:scale-[0.99]"
      >
        <span
          className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full text-[13px] font-extrabold"
          style={{ background: categorySwatch(tint), color: '#fff' }}
        >
          {group.personName.charAt(0).toUpperCase()}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-bold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            {group.personName}
          </span>
          <span className="mt-px block text-[10.5px]" style={{ color: 'var(--text-muted)' }}>
            {count} {count === 1 ? 'gasto' : 'gastos'}
          </span>
        </span>

        <span className="mono-amount flex-none text-[15px] font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>
          S/ {money(group.pending)}
        </span>

        <ChevronDown
          size={15}
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
            className="mx-1 overflow-hidden rounded-b-[16px]"
            style={{ background: 'var(--bg-subtle)' }}
          >
            <div className="px-3 pb-2 pt-1">
              {/* Trae los abonos mientras se abre la persona: al pulsar
                  "Pagó S/…" ya están en caché y la altura no da un salto. */}
              {group.debts
                .filter((d) => d.status === 'PARTIAL')
                .map((d) => <DebtPaymentsPrefetch key={`pf-${d.id}`} debtId={d.id} />)}

              {group.debts.map((d, i) => (
                <div
                  key={d.id}
                  className="py-2.5"
                  style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {d.description || 'Préstamo'}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {SHORT_DATE.format(new Date(`${d.incurredOn}T12:00:00`))}
                        {!d.expenseId && ' · préstamo suelto'}
                      </span>
                    </span>

                    <span className="mono-amount flex-none text-[13.5px] font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      S/ {money(d.pending)}
                    </span>

                    <button
                      type="button"
                      onClick={() => onCollect(d)}
                      className="flex-none cursor-pointer rounded-full px-[13px] py-[6px] text-[11px] font-extrabold transition-transform active:scale-95"
                      style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
                    >
                      {iOwe ? 'Pagar' : 'Cobrar'}
                    </button>
                  </div>

                  {/* Solo con pagos parciales: en una deuda intacta no hay
                      historial que abrir. */}
                  {d.status === 'PARTIAL' && (
                    <button
                      type="button"
                      onClick={() => setOpenHistory((cur) => (cur === d.id ? null : d.id))}
                      aria-expanded={openHistory === d.id}
                      className="mt-1.5 flex cursor-pointer items-center gap-1 text-[11px] font-bold"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {`Pagó S/ ${money(d.paidAmount)} de ${money(d.amount)}`}
                      <ChevronDown
                        size={12}
                        className="transition-transform duration-200"
                        style={{ transform: openHistory === d.id ? 'rotate(180deg)' : 'none' }}
                      />
                    </button>
                  )}

                  {/* Sin `layout` en el padre: animar la altura del contenedor y
                      la del hijo a la vez hacía que se pelearan y el despliegue
                      diera un tirón. */}
                  <AnimatePresence initial={false}>
                    {openHistory === d.id && (
                      <motion.div
                        key="abonos"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: MOTION_S.layer, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <DebtPaymentHistory debtId={d.id} pending={d.pending} iOwe={iOwe} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
