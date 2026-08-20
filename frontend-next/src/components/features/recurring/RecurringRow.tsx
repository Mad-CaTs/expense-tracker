'use client'

import { HOLD_MS, useLongPress } from '@/components/features/shared/useLongPress'
import { categorySwatch } from '@/lib/utils/cardVisuals'
import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import type { RecurringExpense, RecurringFrequency } from '@/types'

const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensual',
  YEARLY: 'Anual',
}

function shortDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

export interface RecurringRowProps {
  item: RecurringExpense
  onToggle: () => void
  onDelete: () => void
}


export function RecurringRow({ item, onToggle, onDelete }: RecurringRowProps) {
  const color = item.categoryColor ?? '#d4af37'
  const tint = categorySwatch(color)
  const Icon = CATEGORY_ICON_MAP[item.categoryIcon ?? 'ellipsis'] ?? CATEGORY_ICON_MAP.ellipsis

  const { holding, handlers, style } = useLongPress({ onPress: () => {}, onHold: onDelete })

  return (
    <div
      {...handlers}
      style={style}
      className={`relative flex select-none items-center gap-2.5 overflow-hidden rounded-[15px] px-2.5 py-[11px] ${item.active ? '' : 'opacity-50'}`}
    >
      <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[12px]" style={{ background: `${color}1f` }}>
        <Icon size={17} style={{ color: tint }} strokeWidth={1.85} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="min-w-0 truncate text-[13.5px] font-bold" style={{ color: 'var(--text-primary)' }}>
            {item.description}
          </span>
          {!item.active && (
            <span
              className="flex-none rounded-full px-2 py-[2px] text-[9px] font-extrabold tracking-[0.04em]"
              style={{ background: 'var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              PAUSADO
            </span>
          )}
        </span>
        {/* Solo la categoría: es el único dato de largo impredecible, así que
            comparte línea con nada. La frecuencia y la próxima fecha se fueron a
            la derecha — antes los tres competían acá y la fecha, que es lo que
            hace actuar, quedaba cortada al final. */}
        <span className="mt-0.5 block truncate text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          {item.categoryName}
        </span>
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={item.active}
        aria-label={item.active ? `Pausar ${item.description}` : `Activar ${item.description}`}
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        onPointerDown={(e) => e.stopPropagation()}
        className="relative h-[22px] w-[38px] flex-none cursor-pointer rounded-full transition-colors"
        style={{ background: item.active ? tint : 'var(--border-strong)' }}
      >
        <span
          className="absolute left-[3px] top-[3px] block h-4 w-4 rounded-full bg-white transition-transform"
          style={{ transform: item.active ? 'translateX(16px)' : 'none' }}
        />
      </button>

      {/* Monto arriba y cuándo vuelve a ejecutarse debajo. La columna mide 104px
          porque "Mensual · 26 jul." ocupa 98px medidos: con menos, el dato que
          hace actuar volvía a cortarse. */}
      <span className="w-[104px] flex-none text-right">
        <span className="mono-amount block text-[13px] font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>
          S/ {(item.amount ?? 0).toFixed(2)}
        </span>
        {/* --text-tertiary y no --text-placeholder: frecuencia y próxima fecha
            son datos, y el tono de relleno no se leía sobre el cristal. */}
        <span className="mt-0.5 block truncate text-[10.5px]" style={{ color: 'var(--text-tertiary)' }}>
          {item.active && item.nextDate
            ? `${FREQUENCY_LABELS[item.frequency]} · ${shortDate(item.nextDate)}`
            : FREQUENCY_LABELS[item.frequency]}
        </span>
      </span>

      {/* Progreso de la presión: hace visible el gesto mientras ocurre. */}
      <span
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
        style={{
          background: 'var(--danger)',
          transform: holding ? 'scaleX(1)' : 'scaleX(0)',
          transition: holding ? `transform ${HOLD_MS}ms linear` : 'transform 120ms var(--ease-sys)',
        }}
      />
    </div>
  )
}
