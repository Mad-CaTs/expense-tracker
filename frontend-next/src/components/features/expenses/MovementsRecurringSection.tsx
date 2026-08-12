'use client'

import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

import { CategoryIcon } from '@/components/features/categories/CategoryIcon'
import { categoryHueSat } from '@/lib/utils/cardVisuals'
import { getCategoryColor } from '@/lib/utils/categoryColors'
import { useCategoryBreakdown } from '@/lib/hooks/useReports'
import { useRecurring } from '@/lib/hooks/useRecurring'
import { useFilterStore } from '@/stores/filterStore'
import type { CategoryBreakdown } from '@/types'
import { categorySwatch } from '@/lib/utils/cardVisuals'

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/** Slots visibles en RECURRENTES. Si hay más, el último slot es el contador "+N". */
const RECURRING_SLOTS = 4

function monthRange(now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = now.getFullYear()
  const m = now.getMonth()
  const from = `${y}-${pad(m + 1)}-01`
  const to = `${y}-${pad(m + 1)}-${pad(new Date(y, m + 1, 0).getDate())}`
  return { from, to, label: MONTHS_ES[m] }
}

function formatAmount(n: number) {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

/** Barra horizontal segmentada por categoría. Construida solo con flex, sin librerías. */
function SegmentedBar({ items }: { items: CategoryBreakdown[] }) {
  const withValue = items.filter((it) => (it.total ?? 0) > 0)

  if (withValue.length === 0) {
    return (
      <div
        className="h-[14px] w-full rounded-[5px]"
        style={{ background: 'var(--border-subtle)' }}
      />
    )
  }

  return (
    <div className="h-[14px] w-full overflow-hidden">
      {/* Pop izq→der: reveal con clip-path + scaleX (CSS, compositor) */}
      <div className="seg-reveal h-full w-full">
        <div className="flex h-full w-full gap-[3px]">
          {withValue.map((it, i) => {
            const weight = it.percentage && it.percentage > 0 ? it.percentage : it.total
            const { h, s } = categoryHueSat(getCategoryColor(it, i))
            return (
              // ...y cada segmento hace fade-in escalonado encima del reveal
              <span
                key={`${it.categoryName}-${i}`}
                className="seg-fade mov-seg rounded-[5px]"
                style={{
                  flexGrow: weight,
                  flexBasis: 0,
                  ['--h' as string]: `${h}`,
                  ['--s' as string]: `${s}%`,
                  ['--enter-i' as string]: i,
                }}
                title={`${it.categoryName} · ${Math.round(it.percentage ?? 0)}%`}
              >
                <span className="mov-seg-aura" aria-hidden>
                  <span className="mov-seg-blob mb1" />
                  <span className="mov-seg-blob mb2" />
                  <span className="mov-seg-blob mb3" />
                </span>
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function FlowRow({
  label,
  amount,
  positive,
  items,
}: {
  label: string
  amount: number
  positive: boolean
  items: CategoryBreakdown[]
}) {
  const monthLabel = monthRange().label

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
            {label}
          </span>
          <span className="text-[11.5px] leading-tight" style={{ color: 'var(--text-placeholder)' }}>
            En {monthLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {positive
            ? <ArrowUpRight size={15} strokeWidth={2.4} style={{ color: 'var(--text-secondary)' }} />
            : <ArrowDownLeft size={15} strokeWidth={2.4} style={{ color: 'var(--text-secondary)' }} />}
          <span className="text-[15px] font-bold tabular-nums leading-none" style={{ color: 'var(--text-primary)' }}>
            {positive ? '+' : '-'}S/{formatAmount(Math.abs(amount))}
          </span>
        </div>
      </div>

      <SegmentedBar items={items} />
    </div>
  )
}

function MovementsCard() {
  const { from, to } = monthRange()
  const walletId = useFilterStore((s) => s.walletId)

  // CUSTOM (no MONTHLY): el backend resuelve MONTHLY con su propio reloj (UTC) e ignora
  // from/to; con CUSTOM respeta el rango del mes calculado en la zona horaria del usuario.
  // walletId filtra por la cuenta activa del carousel (undefined = total de todas).
  const { data: incomeItems = [] } = useCategoryBreakdown({ period: 'CUSTOM', from, to, txType: 'INCOME', walletId })
  const { data: expenseItems = [] } = useCategoryBreakdown({ period: 'CUSTOM', from, to, txType: 'EXPENSE', walletId })

  const incomeTotal = incomeItems.reduce((acc, it) => acc + (it.total ?? 0), 0)
  const expenseTotal = expenseItems.reduce((acc, it) => acc + (it.total ?? 0), 0)

  return (
    <div
      className="liquid-glass flex flex-col gap-5 rounded-[20px] p-[22px]"
    >
      <p className="text-[16px] font-bold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
        Movimientos
      </p>

      <FlowRow label="Ingresos" amount={incomeTotal} positive items={incomeItems} />
      <FlowRow label="Gastos" amount={expenseTotal} positive={false} items={expenseItems} />
    </div>
  )
}

function RecurringCard() {
  const walletId = useFilterStore((s) => s.walletId)
  const { data: recurring = [] } = useRecurring(walletId)

  // Si caben en los slots, se muestran todos; si sobran, el último slot es "+N".
  const overflow = recurring.length > RECURRING_SLOTS
  const visible = recurring.slice(0, overflow ? RECURRING_SLOTS - 1 : RECURRING_SLOTS)
  const extra = recurring.length - visible.length

  return (
    <div
      className="liquid-glass flex flex-col rounded-[20px] px-4 py-[22px]"
    >
      <p className="text-[16px] font-bold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
        Recurrentes
      </p>

      <div className="mt-auto flex flex-1 flex-col items-center justify-center pt-6">
        {visible.map((r, i) => {
          const color = r.categoryColor && r.categoryColor !== '#000000' ? r.categoryColor : '#8a93a4'
          return (
            <div
              key={r.id}
              className="enter-pop-sm flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
              style={{
                background: `${color}1f`,
                border: '2.5px solid var(--lg-avatar-ring)',
                marginTop: i === 0 ? 0 : -10,
                zIndex: i,
                ['--enter-i' as string]: i,
              }}
            >
              <CategoryIcon name={r.categoryIcon || 'ellipsis'} size={19} color={categorySwatch(color)} />
            </div>
          )
        })}

        {extra > 0 && (
          <div
            className="enter-pop-sm flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
            style={{
              background: 'var(--bg-hover)',
              border: '2.5px solid var(--lg-avatar-ring)',
              color: 'var(--text-muted)',
              marginTop: -10,
              zIndex: visible.length,
              ['--enter-i' as string]: visible.length,
            }}
          >
            +{extra}
          </div>
        )}

        {recurring.length === 0 && (
          <span className="text-[12px]" style={{ color: 'var(--text-placeholder)' }}>
            Sin recurrentes
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Sección de dos cards horizontales que reemplaza a "Movimientos recientes".
 * MOVIMIENTOS ocupa ~2x el ancho de RECURRENTES (grid 2fr / 1fr).
 */
export function MovementsRecurringSection() {
  return (
    <div className="grid grid-cols-[2fr_1fr] gap-3 px-4">
      <MovementsCard />
      <RecurringCard />
    </div>
  )
}
