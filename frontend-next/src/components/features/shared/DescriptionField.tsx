'use client'

import { shouldWarn } from '@/lib/utils/fieldLimits'

interface DescriptionFieldProps {
  value: string
  placeholder: string
  /** Distinto por formulario: los recurrentes tienen una columna más corta. */
  limit: number
  error?: string
  /** `false` cuando el campo abre el bloque y no necesita separarse de nada. */
  spaced?: boolean
  onChange: (value: string) => void
}

/**
 * Campo "Descripción" de gastos, ingresos y recurrentes.
 *
 * El contador aparece solo cerca del límite (ver `shouldWarn`) y el `maxLength`
 * corta antes de que el texto llegue al servidor.
 */
export function DescriptionField({
  value,
  placeholder,
  limit,
  error,
  spaced = true,
  onChange,
}: DescriptionFieldProps) {
  const warn = shouldWarn(value.length, limit)

  return (
    <>
      <div className={`mb-2 flex items-baseline justify-between gap-2${spaced ? ' mt-4' : ''}`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
          Descripción
        </p>
        {warn && (
          <span
            className="text-[10px] font-semibold tabular-nums"
            style={{ color: value.length >= limit ? 'var(--danger)' : 'var(--text-muted)' }}
          >
            {value.length}/{limit}
          </span>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        maxLength={limit}
        className="liquid-glass-ic h-[46px] w-full rounded-[16px] px-[15px] text-[14px] outline-none"
        style={{ color: 'var(--text-primary)', ...(error ? { borderColor: 'var(--danger)' } : {}) }}
      />
      {error && <p className="mt-1.5 text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}
    </>
  )
}
