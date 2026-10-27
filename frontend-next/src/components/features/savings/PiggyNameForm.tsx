'use client'

import { useState } from 'react'

import { StepActions } from '@/components/features/shared/StepActions'
import { apiErrorMessage } from '@/lib/api/errors'
import { FIELD_LIMITS } from '@/lib/utils/fieldLimits'

import { SheetViewTitle } from './SheetViewTitle'

interface PiggyNameFormProps {
  title: string
  initialName?: string
  submitLabel: string
  pending: boolean
  /** Devuelve una promesa: si el servidor rechaza (nombre repetido, tope de
   *  4), el motivo se muestra bajo el campo. */
  onSubmit: (name: string) => Promise<unknown>
  onBack: () => void
}

/** Crear o renombrar: lo único que tiene una alcancía es su nombre. */
export function PiggyNameForm({ title, initialName = '', submitLabel, pending, onSubmit, onBack }: PiggyNameFormProps) {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState('')

  async function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) { setError('Ponle un nombre'); return }
    try {
      await onSubmit(trimmed)
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo guardar el nombre'))
    }
  }

  return (
    <>
    <SheetViewTitle>{title}</SheetViewTitle>
    <div className="px-4 pb-4 pt-2">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
        Nombre
      </p>
      <input
        value={name}
        onChange={(e) => { setName(e.target.value); setError('') }}
        onKeyDown={(e) => { if (e.key === 'Enter') void handleSubmit() }}
        placeholder="Viaje, Emergencias…"
        autoComplete="off"
        autoFocus
        maxLength={FIELD_LIMITS.piggyName}
        className="liquid-glass-ic h-[46px] w-full rounded-[16px] px-[15px] text-[14px] font-semibold outline-none"
        style={{ color: 'var(--text-primary)', ...(error ? { borderColor: 'var(--danger)' } : {}) }}
      />
      {error && <p className="mt-1.5 text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}

      <StepActions nextLabel={submitLabel} onNext={handleSubmit} onBack={onBack} pending={pending} />
    </div>
    </>
  )
}
