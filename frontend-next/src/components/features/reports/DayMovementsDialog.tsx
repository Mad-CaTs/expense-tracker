'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

import { categorySwatch } from '@/lib/utils/cardVisuals'
import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import type { PeriodMovement } from './usePeriodMovements'

const money = (n: number) =>
  n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const LONG_DATE = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long' })

interface DayMovementsDialogProps {
  date: string | null
  movements: PeriodMovement[]
  onClose: () => void
}

export function DayMovementsDialog({ date, movements, onClose }: DayMovementsDialogProps) {
  const total = movements.reduce((acc, m) => acc + m.amount + (m.reimbursable ?? 0), 0)
  const formatted = date ? LONG_DATE.format(new Date(`${date}T12:00:00`)) : ''
  const title = formatted ? formatted[0].toUpperCase() + formatted.slice(1) : ''

  return (
    <AnimatePresence>
      {date && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-3rem)] max-w-[320px] -translate-x-1/2 -translate-y-1/2"
            role="dialog"
            aria-label={`Movimientos del ${title}`}
          >
            <div
              className="rounded-[20px] p-[18px]"
              style={{ background: 'var(--surface-raised)', boxShadow: 'var(--depth-panel)' }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[15px] font-extrabold tracking-[-0.01em]" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  /* Sin `day-cell-tap`: ese estado saca la pieza hacia afuera y
                     este botón ya está hundido. Solo se oscurece al pulsar. */
                  className="sunk-tap flex h-[28px] w-[28px] flex-none cursor-pointer items-center justify-center rounded-full"
                  style={{
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-tertiary)',
                    boxShadow: 'var(--depth-hole)',
                  }}
                >
                  <X size={15} strokeWidth={2.4} />
                </button>
              </div>

              {/* La lista scrollea si el día tuvo muchos movimientos: el diálogo
                  no debe crecer hasta salirse de la pantalla. */}
              <ul className="flex max-h-[46vh] flex-col gap-2 overflow-y-auto">
                {movements.map((m) => {
                  const Icon = m.categoryIcon
                    ? (CATEGORY_ICON_MAP[m.categoryIcon] ?? CATEGORY_ICON_MAP.ellipsis)
                    : CATEGORY_ICON_MAP.ellipsis
                  const tint = categorySwatch(m.categoryColor ?? '#d4af37')
                  const income = m.kind === 'income'

                  return (
                    <li
                      key={`${m.kind}-${m.id}`}
                      /* La fila está HUNDIDA en el panel, no flotando sobre él:
                         misma profundidad que el disco vacío del calendario
                         (`--depth-hole`), no una sombra hacia afuera. */
                      className="flex items-center gap-2.5 rounded-[16px] py-[7px] pl-[7px] pr-3.5"
                      style={{ background: 'var(--bg-subtle)', boxShadow: 'var(--depth-hole)' }}
                    >
                      <span
                        className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[10px]"
                        style={{ background: tint, boxShadow: 'var(--depth-chip)' }}
                      >
                        <Icon size={14} strokeWidth={2} style={{ color: '#fff' }} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {m.description || m.categoryName}
                        </span>
                        {m.description && (
                          <span className="block truncate text-[10.5px]" style={{ color: 'var(--text-muted)' }}>
                            {m.categoryName}
                          </span>
                        )}
                      </span>

                      {/* Arriba lo que se pagó; debajo la parte propia, que es
                          la que suma en el total del día. Sin ella la resta no
                          cuadra a ojo y parece un error. */}
                      <span className="flex flex-none flex-col items-end">
                        <span
                          className="mono-amount text-[13px] font-bold tabular-nums"
                          style={{ color: income ? 'var(--success)' : 'var(--text-primary)' }}
                        >
                          {income ? '+' : '−'}S/ {money(Math.abs(m.amount))}
                        </span>
                        {(m.reimbursable ?? 0) > 0 && (
                          <span
                            className="mono-amount text-[10px] font-bold tabular-nums"
                            style={{ color: 'var(--danger)' }}
                          >
                            tú {money(Math.abs(m.amount) - (m.reimbursable ?? 0))}
                          </span>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>

              <p className="mt-3 text-center text-[11.5px]" style={{ color: 'var(--text-muted)' }}>
                Total del día:{' '}
                <b className="mono-amount tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                  {total < 0 ? '−' : '+'}S/ {money(Math.abs(total))}
                </b>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
