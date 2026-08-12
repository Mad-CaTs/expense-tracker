'use client'

export interface SheetStepsProps {
  /** Paso actual, desde 1. */
  step: number
  total: number
  /** Nombre del paso, en el encabezado ("Cuánto y en qué"). */
  label: string
}

/**
 * Indicador de progreso de un sheet por pasos.
 *
 * Vive en `shared` porque lo usan el alta de frecuentes y los tres formularios
 * de acción de /expenses, y el patrón debe leerse igual en todos.
 */
export function SheetSteps({ step, total, label }: SheetStepsProps) {
  return (
    <>
      <div className="mb-3.5 flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="h-[3px] flex-1 rounded-full transition-colors"
            style={{ background: step >= i + 1 ? 'var(--accent-light)' : 'var(--border-subtle)' }}
          />
        ))}
      </div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
        Paso {step} de {total} · {label}
      </p>
    </>
  )
}
