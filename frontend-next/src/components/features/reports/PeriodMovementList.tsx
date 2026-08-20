'use client'

import { useState } from 'react'

import { AnimatePresence } from 'framer-motion'
import { Paperclip, Search, Wallet } from 'lucide-react'

import { AttachmentsModal } from '@/components/features/expenses/AttachmentsModal'
import type { MovementDay, PeriodMovement } from '@/components/features/reports/usePeriodMovements'
import { categorySwatch } from '@/lib/utils/cardVisuals'
import { CATEGORY_ICON_MAP } from '@/lib/utils/categoryIcons'
import { useSheetStore } from '@/stores/sheetStore'

/** Alto de la lista: el viewport menos la cabecera, los chips, las cards de
 *  resumen y el bottom-nav. */
const LIST_MAX_HEIGHT = 'calc(100dvh - 430px)'

interface PeriodMovementListProps {
  days: MovementDay[]
  isLoading: boolean
  /** Título de la card: "Gastos en agosto". */
  title: string
  period: string
}

function Row({ movement }: { movement: PeriodMovement }) {
  const open = useSheetStore((s) => s.open)
  const [showAttachments, setShowAttachments] = useState(false)
  const raw = movement.categoryColor ?? '#d4af37'
  const Icon = movement.categoryIcon ? (CATEGORY_ICON_MAP[movement.categoryIcon] ?? Wallet) : Wallet
  const isExpense = movement.kind === 'expense'

  return (
    <>
    <button
      type="button"
      onClick={() => open(isExpense
        ? { kind: 'expense-form', id: movement.id }
        : { kind: 'income-form', id: movement.id })}
      className="flex w-full cursor-pointer items-center gap-[11px] rounded-[13px] px-1 py-[9px] text-left transition-colors"
    >
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[12px]" style={{ background: `${raw}1f` }}>
        <Icon size={16} strokeWidth={1.9} style={{ color: categorySwatch(raw) }} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-bold" style={{ color: 'var(--text-primary)' }}>
          {movement.description}
        </span>
        <span className="mt-px block truncate text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          {movement.categoryName}
        </span>
      </span>

      {/* Blanco en ambos casos: el signo ya distingue entrada de salida, y el
          verde hacía que los ingresos pesaran más que los gastos en una lista
          donde ninguno de los dos manda. */}
      {/* Clip solo si hay archivos: en las demás filas no añade ruido. Va como
          `span` con rol y no como `button` porque la fila entera YA es un
          botón, y anidarlos es HTML inválido —el navegador desarma el árbol y
          el clic deja de ser fiable. */}
      {(movement.attachmentCount ?? 0) > 0 && (
        <span
          role="button"
          tabIndex={0}
          aria-label={`Ver ${movement.attachmentCount} adjunto(s) de ${movement.description}`}
          onClick={(e) => { e.stopPropagation(); setShowAttachments(true) }}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return
            e.preventDefault()
            e.stopPropagation()
            setShowAttachments(true)
          }}
          className="flex flex-none cursor-pointer items-center gap-1 rounded-full px-1.5 py-1 text-[10.5px] font-bold"
          style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
        >
          <Paperclip size={11} strokeWidth={2.2} />
          {movement.attachmentCount}
        </span>
      )}

      <span className="mono-amount flex-none text-[13px] font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>
        {isExpense ? '−' : '+'}S/ {Math.abs(movement.amount).toFixed(2)}
      </span>

    </button>

      {/* Fuera del <button> de la fila: el visor tiene sus propios botones
          (cerrar, descargar) y anidarlos dentro de otro es HTML inválido —React
          lo reporta y la hidratación se rompe. Ya trae scroll propio
          (maxHeight + overflow-y), así que con muchos adjuntos se desliza. */}
      <AnimatePresence>
        {showAttachments && (
          <AttachmentsModal
            expenseId={movement.id}
            description={movement.description}
            onClose={() => setShowAttachments(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * Movimientos del período, agrupados por día.
 *
 * El encabezado de día ("Hoy", "Ayer", "9 ago.") es un patrón que no existe en
 * las otras listas de la app: acá se justifica porque el rango abarca semanas y
 * sin él las fechas se pierden en la columna derecha de cada fila.
 */
export function PeriodMovementList({ days, isLoading, title, period }: PeriodMovementListProps) {
  const [query, setQuery] = useState('')

  const needle = query.trim().toLowerCase()
  const filtered = needle
    ? days
        .map((d) => ({ ...d, movements: d.movements.filter((m) =>
            m.description.toLowerCase().includes(needle) || m.categoryName.toLowerCase().includes(needle)) }))
        .filter((d) => d.movements.length > 0)
    : days

  return (
    <div className="liquid-glass mx-4 mb-4 rounded-[22px] px-4 pb-4 pt-[18px]">
      <p className="text-[16px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
        {title} en <span style={{ color: 'var(--text-tertiary)' }}>{period}</span>
      </p>

      <div className="liquid-glass-ic mt-3.5 flex h-11 items-center gap-2.5 rounded-[14px] px-3.5">
        <Search size={15} className="flex-none" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar movimiento"
          autoComplete="off"
          className="search-input w-full bg-transparent text-[13px] outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* Scroll propio: un mes puede traer decenas de movimientos y sin esto
          había que recorrer toda la página para volver a los filtros. El alto
          se calcula contra el viewport para que la card llegue justo por encima
          del bottom-nav en cualquier pantalla. */}
      <div
        className="mt-1 overflow-y-auto"
        style={{ maxHeight: LIST_MAX_HEIGHT, overscrollBehavior: 'contain', scrollbarWidth: 'none' }}
      >
        {isLoading ? (
          <div className="flex flex-col gap-2 pt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[52px] animate-pulse rounded-[13px]" style={{ background: 'var(--skeleton-from)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-1 py-8 text-center text-[12.5px]" style={{ color: 'var(--text-muted)' }}>
            {needle ? 'Sin resultados' : 'Sin movimientos en este período'}
          </p>
        ) : (
          filtered.map((day) => (
            <div key={day.date}>
              {/* Sin sticky ni fondo: hacía falta un color opaco para tapar las
                  filas al pasar por debajo, y sobre el cristal de la card eso se
                  veía como una banda gris. El día acompaña a su grupo y se va
                  con él. */}
              <p
                className="px-1 pb-1.5 pt-3.5 text-[12.5px] font-extrabold"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {day.label}
              </p>
              {day.movements.map((m) => <Row key={m.key} movement={m} />)}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
