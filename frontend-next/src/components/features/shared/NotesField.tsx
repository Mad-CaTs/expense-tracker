'use client'

import { FIELD_LIMITS, shouldWarn } from '@/lib/utils/fieldLimits'

interface NotesFieldProps {
  value: string
  placeholder: string
  /** El campo no siempre escribe en `notes`: la transferencia lo usa para su
   *  `description`, que es varchar(500). Por defecto, el límite de `notes`. */
  limit?: number
  onChange: (value: string) => void
}

export function NotesField({
  value,
  placeholder,
  limit = FIELD_LIMITS.notes,
  onChange,
}: NotesFieldProps) {
  const warn = shouldWarn(value.length, limit)

  return (
    <>
      <div className="mb-2 mt-4 flex items-baseline justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
          Nota{' '}
          <span className="font-semibold normal-case tracking-normal">(opcional)</span>
        </p>
        {/* Solo cerca del límite: ver `shouldWarn`. */}
        {warn && (
          <span
            className="text-[10px] font-semibold tabular-nums"
            style={{ color: value.length >= limit ? 'var(--danger)' : 'var(--text-muted)' }}
          >
            {value.length}/{limit}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={limit}
        className="liquid-glass-ic w-full resize-none rounded-[16px] px-[15px] py-3 text-[14px] outline-none"
        style={{ color: 'var(--text-primary)' }}
      />
    </>
  )
}
