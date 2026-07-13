'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AttachmentSection, type PendingFile } from '@/components/features/expenses/AttachmentSection'
import { AmountField } from '@/components/features/shared/AmountField'
import { CategorySelector } from '@/components/features/shared/CategorySelector'
import { DateField } from '@/components/features/shared/DateField'
import { FormActions } from '@/components/features/shared/FormActions'
import { NotesField } from '@/components/features/shared/NotesField'
import { WalletSelector } from '@/components/features/shared/WalletSelector'
import { uploadAttachment } from '@/lib/api/attachments'
import { useCategories } from '@/lib/hooks/useCategories'
import { useCreateExpense, useExpense, useUpdateExpense } from '@/lib/hooks/useExpenses'
import { useWallets } from '@/lib/hooks/useWallets'
import { Expense } from '@/types'

interface ExpenseFormProps {
  expenseId?: number
  onDone?: () => void
  onRequestDelete?: () => void
}

interface FormInnerProps {
  expense?: Expense
  expenseId?: number
  onDone?: () => void
  onRequestDelete?: () => void
}

function ExpenseFormInner({ expense, expenseId, onDone, onRequestDelete }: FormInnerProps) {
  const router = useRouter()
  const isEdit = expenseId != null && expenseId > 0
  const embedded = onDone != null

  const { data: categories } = useCategories('EXPENSE')
  const { data: wallets } = useWallets()
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()

  const [description, setDescription] = useState(expense?.description ?? '')
  const [rawAmount, setRawAmount] = useState(expense ? expense.amount.toString() : '')
  const [date, setDate] = useState(
    expense ? expense.date.split('T')[0] : (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })()
  )
  const [categoryId, setCategoryId] = useState(expense ? expense.categoryId.toString() : '')
  const [walletId, setWalletId] = useState(expense?.walletId?.toString() ?? '')
  const [notes, setNotes] = useState(expense?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])

  function validate() {
    const errs: Record<string, string> = {}
    if (!description.trim()) errs.description = 'Requerido'
    if (!rawAmount || isNaN(Number(rawAmount)) || Number(rawAmount) <= 0) errs.amount = 'Monto inválido'
    if (!date) errs.date = 'Requerido'
    if (!categoryId) errs.categoryId = 'Selecciona una categoría'
    if (wallets && wallets.length > 0 && !walletId) errs.walletId = 'Selecciona un wallet'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const payload = {
      description: description.trim(),
      amount: Number(rawAmount),
      date,
      notes: notes.trim() || undefined,
      categoryId: Number(categoryId),
      walletId: walletId ? Number(walletId) : undefined,
    }
    if (isEdit && expenseId) {
      await updateExpense.mutateAsync({ id: expenseId, data: payload })
      await Promise.all(pendingFiles.map(p => uploadAttachment(expenseId, p.file)))
    } else {
      await createExpense.mutateAsync(payload)
    }
    setPendingFiles([])
    if (onDone) onDone()
    else router.push('/expenses')
  }

  const isSubmitting = createExpense.isPending || updateExpense.isPending

  return (
    <div className={`relative flex flex-col ${embedded ? 'pb-4' : 'pb-28'}`}>

      {/* Description */}
      <div className="px-4 pt-4 pb-2">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Descripción
          </p>
          {errors.description && (
            <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{errors.description}</p>
          )}
        </div>
        <input
          type="text"
          value={description}
          onChange={(e) => { setDescription(e.target.value); setErrors(e => ({ ...e, description: '' })) }}
          placeholder="¿En qué gastaste?"
          className="input-borderless w-full px-3 py-2.5 text-[14px] font-medium outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      <AmountField
        label="Monto del gasto"
        inputId="amount-keyboard-input"
        value={rawAmount}
        activeColor="var(--danger)"
        error={errors.amount}
        onChange={(v) => {
          setRawAmount(v)
          if (v && Number(v) > 0) setErrors(e => ({ ...e, amount: '' }))
        }}
      />

      <DateField value={date} onChange={setDate} />

      <CategorySelector
        type="EXPENSE"
        categories={categories}
        selectedId={categoryId}
        error={errors.categoryId}
        onSelect={(id) => { setCategoryId(id); setErrors(e => ({ ...e, categoryId: '' })) }}
        onCreated={(cat) => { setCategoryId(cat.id.toString()); setErrors(e => ({ ...e, categoryId: '' })) }}
      />

      <WalletSelector
        wallets={wallets}
        selectedId={walletId}
        error={errors.walletId}
        onSelect={(id) => { setWalletId(id); setErrors(e => ({ ...e, walletId: '' })) }}
      />

      <NotesField
        value={notes}
        placeholder="Comercio, referencia... (opcional)"
        onChange={setNotes}
      />

      {/* Attachments — solo en edición */}
      {isEdit && expenseId && (
        <AttachmentSection
          expenseId={expenseId}
          pendingFiles={pendingFiles}
          onAddFiles={(files) => setPendingFiles(prev => [...prev, ...files])}
          onRemovePending={(id) => setPendingFiles(prev => prev.filter(p => p.id !== id))}
        />
      )}

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

export function ExpenseForm({ expenseId, onDone, onRequestDelete }: ExpenseFormProps) {
  const isEdit = expenseId != null && expenseId > 0
  const { data: expense, isLoading: loadingExpense } = useExpense(expenseId ?? 0)

  if (isEdit && loadingExpense) {
    return <div className="px-4 py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando...</div>
  }

  return (
    <ExpenseFormInner
      key={expense?.id ?? 'new'}
      expense={expense}
      expenseId={expenseId}
      onDone={onDone}
      onRequestDelete={onRequestDelete}
    />
  )
}
