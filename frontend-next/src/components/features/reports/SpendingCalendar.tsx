'use client'

import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import { categorySwatch } from '@/lib/utils/cardVisuals'
import type { DailyTotal } from '@/types'
import { useWalletCurrency } from '@/lib/hooks/useWallets'
import { symbolOf } from '@/lib/utils/currency'

/** Mismas iniciales y orden que `RangeCalendar`: la semana empieza en lunes. */
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const money = (n: number) =>
  n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

const pad = (n: number) => String(n).padStart(2, '0')
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

interface SpendingCalendarProps {
  daily: DailyTotal[]
  from: string
  to: string
  isIncome: boolean
  /** Abre el detalle del día. Solo los días con movimiento son pulsables. */
  onSelectDay?: (iso: string) => void
}

/**
 * Calendario del periodo: cada día es una tarjeta y los que tuvieron movimiento
 * muestran el icono de su categoría dominante.
 *
 * El icono dice de un vistazo EN QUÉ se gastó cada día, no solo cuánto — que es
 * lo que un mapa de calor por opacidad nunca llegó a transmitir. Los días sin
 * movimiento conservan su tarjeta con un disco tenue: así la rejilla mantiene
 * su ritmo y los días con gasto resaltan por contraste, no por hueco.
 */
export function SpendingCalendar({ daily, from, to, isIncome, onSelectDay }: SpendingCalendarProps) {
  const sym = symbolOf(useWalletCurrency())
  const start = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T00:00:00')
  const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
  if (totalDays <= 1) return null

  const byDay = new Map(daily.map((d) => [d.date, d]))
  if (daily.every((d) => (d.total ?? 0) <= 0)) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cells = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const iso = isoOf(d)
    return { iso, day: d.getDate(), entry: byDay.get(iso), future: d > today }
  })

  /* Hueco inicial para que el día 1 caiga en su columna. `getDay()` da 0 para
     domingo y la semana empieza en lunes, de ahí el ajuste. */
  const lead = (start.getDay() + 6) % 7

  const activeDays = daily.filter((d) => (d.total ?? 0) > 0).length
  const top = daily.reduce<DailyTotal | null>(
    (best, d) => ((d.total ?? 0) > (best?.total ?? 0) ? d : best),
    null,
  )

  return (
    <div>
      <div className="grid grid-cols-7 gap-[5px]">
        {WEEKDAYS.map((d, i) => (
          <span
            key={i}
            className="pb-1 text-center text-[10px] font-bold"
            style={{ color: 'var(--text-label)' }}
          >
            {d}
          </span>
        ))}

        {Array.from({ length: lead }).map((_, i) => (
          <span key={`lead-${i}`} aria-hidden />
        ))}

        {cells.map((c) => {
          const amount = c.entry?.total ?? 0
          const spent = amount > 0
          const Icon = c.entry?.categoryIcon
            ? (CATEGORY_ICON_MAP[c.entry.categoryIcon] ?? CATEGORY_ICON_MAP.ellipsis)
            : null
          const tint = spent
            ? categorySwatch(c.entry?.categoryColor ?? (isIncome ? '#4ade80' : '#ef4444'))
            : undefined

          const Cell = (spent && onSelectDay ? 'button' : 'span') as 'button' | 'span'

          return (
            <Cell
              key={c.iso}
              type={Cell === 'button' ? 'button' : undefined}
              onClick={spent && onSelectDay ? () => onSelectDay(c.iso) : undefined}
              title={spent ? `${c.day}: ${sym} ${money(amount)} · ${c.entry?.categoryName ?? ''}` : String(c.day)}
              className={`day-cell flex flex-col items-center justify-center gap-[4px] rounded-[15px]${
                spent && onSelectDay ? ' day-cell-tap cursor-pointer' : ''
              }`}
              style={{
                // Vertical, no cuadrada: el disco manda y el número lo acompaña
                // debajo, como en una tecla.
                aspectRatio: '1 / 1.24',
                background: 'var(--surface-raised)',
                boxShadow: spent ? 'var(--depth-card-lift)' : 'var(--depth-card)',
                opacity: c.future ? 0.45 : 1,
              }}
            >
              {/* El disco es un HUECO en la tarjeta: relleno más oscuro que ella
                  y sombra INTERIOR arriba, para que se lea excavado. Los días
                  con movimiento lo tapan con el color de su categoría, que pasa
                  a flotar —de hueco a ficha— y por eso lleva sombra propia. */}
              <span
                className="flex h-[26px] w-[26px] items-center justify-center rounded-full"
                style={
                  spent
                    ? { background: tint, boxShadow: 'var(--depth-chip)' }
                    : {
                        background: 'var(--depth-hole-fill)',
                        boxShadow: 'var(--depth-hole)',
                      }
                }
              >
                {Icon && <Icon size={13} strokeWidth={2} style={{ color: '#fff' }} />}
              </span>
              <span
                className="text-[12px] font-bold tabular-nums"
                // Los días sin gasto van más apagados que los que tienen, pero
                // legibles: --text-tertiary daba 3.4:1 sobre la tarjeta.
                style={{ color: spent ? 'var(--text-primary)' : 'var(--text-label)' }}
              >
                {c.day}
              </span>
            </Cell>
          )
        })}
      </div>

      <div
        className="mt-3 flex items-center justify-between gap-3 text-[11px]"
        style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12, color: 'var(--text-muted)' }}
      >
        <span>
          <b className="tabular-nums" style={{ color: 'var(--text-primary)' }}>{activeDays}</b>{' '}
          {activeDays === 1 ? 'día' : 'días'} con {isIncome ? 'ingresos' : 'gastos'}
        </span>
        {top && (top.total ?? 0) > 0 && (
          <span>
            El mayor:{' '}
            <b className="mono-amount tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {sym} {money(top.total ?? 0)}
            </b>
          </span>
        )}
      </div>

    </div>
  )
}
