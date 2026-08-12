'use client'

import { useState } from 'react'

import { ArrowDown } from 'lucide-react'

import { AmountField } from '@/components/features/shared/AmountField'
import { DateField } from '@/components/features/shared/DateField'
import { NotesField } from '@/components/features/shared/NotesField'
import { SheetSteps } from '@/components/features/shared/SheetSteps'
import { StepActions } from '@/components/features/shared/StepActions'
import { WalletSelector } from '@/components/features/shared/WalletSelector'
import type { TxSummary } from '@/components/features/shared/txSummary'
import { useFormSteps } from '@/components/features/shared/useFormSteps'
import { useCreateTransfer } from '@/lib/hooks/useTransfers'
import type { Wallet } from '@/types'

interface TransferSheetProps {
  wallets: Wallet[]
  presetFromId?: number
  onDone: () => void
  /** Resumen de lo transferido, para el aviso de éxito del contenedor. */
  onSaved?: (summary: TxSummary) => void
}

export function TransferSheet({ wallets, presetFromId, onDone, onSaved }: TransferSheetProps) {
  const today = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

  const [fromId, setFromId] = useState(presetFromId ? String(presetFromId) : '')
  const [toId, setToId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayStr)
  const [error, setError] = useState('')
  const create = useCreateTransfer()

  const { step, stepDir, goNext, goBack, goTo } = useFormSteps(2)

  /** Paso 1: monto y las dos cuentas. El resto es opcional. */
  function validateStep1(): boolean {
    if (!fromId || !toId) { setError('Selecciona origen y destino'); return false }
    if (fromId === toId) { setError('Origen y destino no pueden ser iguales'); return false }
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { setError('Monto inválido'); return false }
    setError('')
    return true
  }

  async function handleSubmit() {
    // Los dos pasos, no solo el visible: se puede volver al paso 1 y vaciar un
    // campo antes de avanzar de nuevo.
    if (!validateStep1()) { goTo(1); return }
    if (!date) { setError('Selecciona una fecha'); return }
    const amt = parseFloat(amount)
    await create.mutateAsync({ fromWalletId: Number(fromId), toWalletId: Number(toId), amount: amt, description: description.trim() || undefined, date })
    const from = wallets.find((w) => String(w.id) === fromId)?.name ?? ''
    const to = wallets.find((w) => String(w.id) === toId)?.name ?? ''
    onSaved?.({ kind: 'transfer', edited: false, amount: amt, label: `${from} → ${to}` })
    onDone()
  }

  return (
    <div className="flex flex-col px-4 pb-4">
      <SheetSteps step={step} total={2} label={step === 1 ? 'Cuánto y entre qué' : 'Detalle' } />

      <div key={step} className={stepDir === 'fwd' ? 'step-fwd' : 'step-back'}>
        {step === 1 ? (
          <>
            <AmountField
              label="Monto a transferir"
              inputId="transfer-amount-input"
              // Neutro y no rojo/verde: una transferencia no suma ni resta
              // patrimonio, solo lo mueve entre cuentas.
              activeColor="var(--text-primary)"
              value={amount}
              error={error && error.includes('Monto') ? error : undefined}
              onChange={(v) => { setAmount(v); setError('') }}
            />

            <WalletSelector
              label="Desde"
              wallets={wallets}
              selectedId={fromId}
              onSelect={(id) => { setFromId(id); if (id === toId) setToId(''); setError('') }}
            />

            <div className="mt-3 flex justify-center">
              <ArrowDown size={20} style={{ color: 'var(--text-muted)' }} />
            </div>

            {/* La cuenta de origen se deshabilita acá: transferir a sí misma es
                el error más fácil de cometer con dos listas idénticas. */}
            <WalletSelector
              label="Hacia"
              wallets={wallets}
              selectedId={toId}
              excludeId={fromId}
              onSelect={(id) => { setToId(id); setError('') }}
            />

            {error && !error.includes('Monto') && (
              <p className="mt-2 text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>
            )}

            <StepActions
              nextLabel="Siguiente"
              onNext={() => goNext(validateStep1)}
              onCancel={onDone}
            />
          </>
        ) : (
          <>
            <DateField value={date} onChange={setDate} />

            <NotesField
              value={description}
              placeholder="Motivo de la transferencia (opcional)"
              onChange={setDescription}
            />

            {error && <p className="mt-2 text-[11px]" style={{ color: 'var(--danger)' }}>{error}</p>}

            <StepActions
              nextLabel="Transferir"
              pending={create.isPending}
              onNext={handleSubmit}
              onBack={goBack}
            />
          </>
        )}
      </div>
    </div>
  )
}
