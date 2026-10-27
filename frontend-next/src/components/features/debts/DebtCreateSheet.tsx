'use client'

import { useState } from 'react'

import { AmountField } from '@/components/features/shared/AmountField'
import { DateField } from '@/components/features/shared/DateField'
import { DescriptionField } from '@/components/features/shared/DescriptionField'
import { StepActions } from '@/components/features/shared/StepActions'
import { WalletSelector } from '@/components/features/shared/WalletSelector'
import { Sheet } from '@/components/ui/Sheet'
import { useActiveWallet } from '@/lib/hooks/useActiveWallet'
import { useCreateDebt } from '@/lib/hooks/useDebts'
import { useWallets } from '@/lib/hooks/useWallets'
import { FIELD_LIMITS } from '@/lib/utils/fieldLimits'
import { todayIso } from '@/lib/utils/dates'
import type { DebtDirection } from '@/types'

import type { DebtCreateConfig } from './debtViews'

interface DebtCreateSheetProps {
  direction: DebtDirection
  /** Lo que registra la vista desde la que se abrió: el tipo ya está decidido. */
  config: DebtCreateConfig
  onClose: () => void
  /** Devuelve lo creado para que la pantalla lo nombre en el aviso. */
  onDone: (debt: { amount: number; personName: string }) => void
}

/**
 * Alta de una deuda SUELTA. No pregunta el tipo: lo decide la pestaña en la
 * que estás, que es donde el usuario ya eligió qué está registrando.
 *
 * <p>Un préstamo mueve el saldo al crearse —no hay ningún `Expense` que ya haya
 * descontado ese dinero— y por eso pide billetera. "Alguien pagó por ti" no
 * movió dinero: va sin billetera y solo pagarla lo descuenta.
 */
export function DebtCreateSheet({ direction, config, onClose, onDone }: DebtCreateSheetProps) {
  const { data: wallets } = useWallets()
  const activeWalletId = useActiveWallet()
  const createDebt = useCreateDebt()

  const [personName, setPersonName] = useState('')
  const [rawAmount, setRawAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayIso())
  const [walletId, setWalletId] = useState(activeWalletId ? String(activeWalletId) : '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { needsWallet } = config

  async function handleSubmit() {
    const errs: Record<string, string> = {}
    if (!personName.trim()) errs.personName = 'Requerido'
    if (!rawAmount || Number(rawAmount) <= 0) errs.amount = 'Monto inválido'
    if (needsWallet && !walletId) errs.wallet = 'Elige una billetera'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    await createDebt.mutateAsync({
      direction,
      kind: config.kind,
      personName: personName.trim(),
      amount: Number(rawAmount),
      walletId: needsWallet ? Number(walletId) : undefined,
      description: description.trim() || undefined,
      incurredOn: date,
    })
    onDone({ amount: Number(rawAmount), personName: personName.trim() })
  }

  return (
    <Sheet onClose={onClose} title={config.title}>
      {/* `pt-3`: separa el título del monto, que es lo primero que se llena. */}
      <div className="px-4 pb-4 pt-3">
        <AmountField
          label="Monto"
          inputId="debt-new-amount"
          walletId={needsWallet && walletId ? Number(walletId) : undefined}
          value={rawAmount}
          error={errors.amount}
          onChange={(v) => { setRawAmount(v); setErrors((e) => ({ ...e, amount: '' })) }}
        />

        <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
          Nombre
        </p>
        <input
          value={personName}
          onChange={(e) => { setPersonName(e.target.value); setErrors((x) => ({ ...x, personName: '' })) }}
          placeholder="Ej. Ana"
          autoComplete="off"
          maxLength={FIELD_LIMITS.personName}
          className="liquid-glass-ic h-[46px] w-full rounded-[16px] px-[15px] text-[14px] font-semibold outline-none"
          style={{ color: 'var(--text-primary)', ...(errors.personName ? { borderColor: 'var(--danger)' } : {}) }}
        />
        {errors.personName && (
          <p className="mt-1.5 text-[11px]" style={{ color: 'var(--danger)' }}>{errors.personName}</p>
        )}

        <DescriptionField
          value={description}
          placeholder="Opcional"
          limit={FIELD_LIMITS.description}
          onChange={setDescription}
        />

        <DateField value={date} onChange={setDate} label="Fecha" />

        {needsWallet && (
          <WalletSelector
            wallets={wallets}
            selectedId={walletId}
            error={errors.wallet}
            label="Billetera"
            onSelect={(id) => { setWalletId(id); setErrors((e) => ({ ...e, wallet: '' })) }}
          />
        )}

        <StepActions
          nextLabel="Registrar"
          onNext={handleSubmit}
          onCancel={onClose}
          pending={createDebt.isPending}
        />
      </div>
    </Sheet>
  )
}
