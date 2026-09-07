'use client'

import { categorySwatch } from '@/lib/utils/cardVisuals'
import type { CategoryBreakdown } from '@/types'

export interface CategoryDelta {
  name: string
  color?: string
  current: number
  previous: number
  /** `current - previous`. Positivo = se gastó más que el periodo anterior. */
  delta: number
  kind: 'nueva' | 'desaparecida' | 'cambio'
}

/**
 * Cruza el gasto de este periodo con el del anterior.
 *
 * Ordena por variación ABSOLUTA, no por total: lo que más cambió es lo que hay
 * que mirar, aunque no sea la categoría más cara.
 *
 * Las que no existían antes se marcan "nueva" en vez de un +100% contra cero.
 * Las que estaban y este periodo no tienen movimientos NO llevan etiqueta: su
 * importe en 0 ya lo dice, y cualquier texto ("ya no", "sin registros") afirma
 * algo que no consta — puede que el gasto exista y aún no se haya anotado.
 */
export function buildDeltas(
  current: CategoryBreakdown[],
  previous: CategoryBreakdown[],
): CategoryDelta[] {
  const prev = new Map(previous.map((b) => [b.categoryName, b.total ?? 0]))
  const seen = new Set<string>()

  const rows: CategoryDelta[] = current.map((b) => {
    const name = b.categoryName
    seen.add(name)
    const now = b.total ?? 0
    const before = prev.get(name) ?? 0
    return {
      name,
      color: b.color,
      current: now,
      previous: before,
      delta: now - before,
      kind: before === 0 ? 'nueva' : 'cambio',
    }
  })

  // Estaban antes y este periodo no tienen registros: también es un cambio.
  for (const b of previous) {
    if (seen.has(b.categoryName)) continue
    rows.push({
      name: b.categoryName,
      color: b.color,
      current: 0,
      previous: b.total ?? 0,
      delta: -(b.total ?? 0),
      kind: 'desaparecida',
    })
  }

  return rows.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
}

const money = (n: number) =>
  n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

interface CategoryDeltasProps {
  deltas: CategoryDelta[]
  /** Etiqueta del periodo anterior, p. ej. "julio". */
  previousLabel: string
}

/* Los anchos se comparten entre la cabecera y las filas. Sin ancho fijo cada
   celda se ajusta a SU texto —"Este periodo" es más ancho que "S/ 454"— y el
   título dejaría de caer sobre su columna. */
const TOTAL_COL = 'w-[72px] flex-none text-right'
const DELTA_COL = 'w-[86px] flex-none text-right'

export function CategoryDeltas({ deltas, previousLabel }: CategoryDeltasProps) {
  if (deltas.length === 0) {
    return (
      <p className="py-6 text-center text-[12.5px]" style={{ color: 'var(--text-muted)' }}>
        Sin movimientos que comparar con {previousLabel}.
      </p>
    )
  }

  return (
    <>
      {/* Sin las cabeceras, las dos cifras se confunden: la primera es cuánto
          llevas este periodo y la segunda cuánto cambió respecto al anterior. */}
      <div
        className="flex items-center gap-2.5 pb-2 text-[10px] font-bold uppercase tracking-[0.08em]"
        style={{ color: 'var(--text-label)' }}
      >
        {/* Hueco del punto de color, para que "Categoría" caiga sobre el nombre. */}
        <span className="h-[9px] w-[9px] flex-none" aria-hidden />
        <span className="min-w-0 flex-1">Categoría</span>
        {/* "Gastado" y no "Este periodo": el subtítulo de la card ya dice contra
            qué se compara, y el texto largo no entra en el ancho de la columna. */}
        <span className={TOTAL_COL}>Gastado</span>
        <span className={DELTA_COL}>Cambio</span>
      </div>

      <ul className="flex flex-col">
        {deltas.map((d, i) => {
          const tint = categorySwatch(d.color ?? '#d4af37')
          // Subir el gasto es "malo" (rojo) y bajarlo "bueno" (verde): el mismo
          // código de color que usa el resto de la app para gastos e ingresos.
          const worse = d.delta > 0
          return (
            <li
              key={d.name}
              className="flex items-center gap-2.5 py-[9px]"
              style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}
            >
              <span className="h-[9px] w-[9px] flex-none rounded-full" style={{ background: tint }} />
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {d.name}
              </span>
              <span className={`mono-amount ${TOTAL_COL} text-[12px] font-bold tabular-nums`} style={{ color: 'var(--text-secondary)' }}>
                S/ {money(d.current)}
              </span>
              <span
                className={`mono-amount ${DELTA_COL} text-[11px] font-extrabold tabular-nums`}
                style={{
                  color: d.kind === 'nueva'
                    ? 'var(--text-muted)'
                    : worse ? 'var(--danger)' : 'var(--success)',
                }}
              >
                {d.kind === 'nueva'
                  ? 'nueva'
                  : d.kind === 'desaparecida'
                    ? ''
                    : `${worse ? '+' : '−'}S/ ${money(Math.abs(d.delta))}`}
              </span>
            </li>
          )
        })}
      </ul>
    </>
  )
}
