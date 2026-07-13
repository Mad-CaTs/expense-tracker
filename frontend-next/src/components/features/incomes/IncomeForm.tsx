'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AmountField } from '@/components/features/shared/AmountField'
import { CategorySelector } from '@/components/features/shared/CategorySelector'
import { DateField } from '@/components/features/shared/DateField'
import { FormActions } from '@/components/features/shared/FormActions'
import { NotesField } from '@/components/features/shared/NotesField'
import { WalletSelector } from '@/components/features/shared/WalletSelector'
import { useCategories } from '@/lib/hooks/useCategories'
import { useCreateIncome, useIncome, useUpdateIncome } from '@/lib/hooks/useIncomes'
import { useWallets } from '@/lib/hooks/useWallets'
import type { Income } from '@/types'

interface IncomeFormProps {
  incomeId?: number
  onDone?: () => void
  onRequestDelete?: () => void
}

interface FormInnerProps {
  income?: Income
  incomeId?: number
  onDone?: () => void
  onRequestDelete?: () => void
}

function IncomeFormInner({ income, incomeId, onDone, onRequestDelete }: FormInnerProps) {
  const router = useRouter()
  const isEdit = incomeId != null && incomeId > 0
  const embedded = onDone != null

  const { data: wallets } = useWallets()
  const { data: categories } = useCategories('INCOME')
  const createIncome = useCreateIncome()
  const updateIncome = useUpdateIncome()

  const [description, setDescription] = useState(income?.description ?? '')
  const [rawAmount, setRawAmount] = useState(income ? income.amount.toString() : '')
  const [date, setDate] = useState(
    income ? income.date.split('T')[0] : (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })()
  )
  const [walletId, setWalletId] = useState(income?.walletId?.toString() ?? '')
  const [categoryId, setCategoryId] = useState(income?.categoryId?.toString() ?? '')
  const [notes, setNotes] = useState(income?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!rawAmount || isNaN(Number(rawAmount)) || Number(rawAmount) <= 0) errs.amount = 'Monto inválido'
    if (!date) errs.date = 'Requerido'
    if (wallets && wallets.length > 0 && !walletId) errs.walletId = 'Selecciona un wallet'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const payload = {
      amount: Number(rawAmount),
      description: description.trim() || undefined,
      date,
      notes: notes.trim() || undefined,
      walletId: walletId ? Number(walletId) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
    }
    if (isEdit && incomeId) {
      await updateIncome.mutateAsync({ id: incomeId, data: payload as Omit<Income, 'id'> })
    } else {
      await createIncome.mutateAsync(payload)
    }
    if (onDone) onDone()
    else router.push('/expenses')
  }

  const isSubmitting = createIncome.isPending || updateIncome.isPending

  return (
    <div className={`relative flex flex-col ${embedded ? 'pb-4' : 'pb-28'}`}>

      {/* Description */}
      <div className="px-4 pt-4 pb-2">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Descripción
        </p>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej. Salario, freelance, venta..."
          className="input-borderless w-full px-3 py-2.5 text-[14px] font-medium outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      <AmountField
        label="Monto del ingreso"
        inputId="income-amount-input"
        value={rawAmount}
        activeColor="var(--success)"
        error={errors.amount}
        onChange={(v) => {
          setRawAmount(v)
          if (v && Number(v) > 0) setErrors(e => ({ ...e, amount: '' }))
        }}
      />

      <DateField value={date} onChange={setDate} />

      {/* Category (opcional) */}
      {categories && categories.length > 0 && (
        <CategorySelector
          type="INCOME"
          categories={categories}
          selectedId={categoryId}
          onSelect={(id) => setCategoryId(categoryId === id ? '' : id)}
          onCreated={(cat) => setCategoryId(cat.id.toString())}
        />
      )}

      <WalletSelector
        wallets={wallets}
        selectedId={walletId}
        error={errors.walletId}
        onSelect={(id) => { setWalletId(id); setErrors(e => ({ ...e, walletId: '' })) }}
      />

      <NotesField
        value={notes}
        placeholder="Detalles adicionales del ingreso..."
        onChange={setNotes}
      />

      <FormActions
        embedded={embedded}
        isEdit={isEdit}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onRequestDelete={onRequestDelete}
      />
    </div>
  )
}

export function IncomeForm({ incomeId, onDone, onRequestDelete }: IncomeFormProps) {
  const isEdit = incomeId != null && incomeId > 0
  const { data: income, isLoading } = useIncome(incomeId ?? 0)

  if (isEdit && isLoading) {
    return <div className="px-4 py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando...</div>
  }

  return (
    <IncomeFormInner
      key={income?.id ?? 'new'}
      income={income}
      incomeId={incomeId}
      onDone={onDone}
      onRequestDelete={onRequestDelete}
    />
  )
}
