'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useCategories } from '@/lib/hooks/useCategories'
import { useCreateExpense, useExpense, useUpdateExpense } from '@/lib/hooks/useExpenses'
import { Expense } from '@/types'

interface ExpenseFormProps {
  expenseId?: number
}

interface FormInnerProps {
  expense?: Expense
  expenseId?: number
}

function ExpenseFormInner({ expense, expenseId }: FormInnerProps) {
  const router = useRouter()
  const isEdit = expenseId != null && expenseId > 0

  const { data: categories } = useCategories()
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()

  const [description, setDescription] = useState(expense?.description ?? '')
  const [amount, setAmount] = useState(expense ? expense.amount.toString() : '')
  const [date, setDate] = useState(
    expense ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0]
  )
  const [categoryId, setCategoryId] = useState(expense ? expense.category.id.toString() : '')
  const [notes, setNotes] = useState(expense?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!description.trim()) errs.description = 'Requerido'
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) errs.amount = 'Monto inválido'
    if (!date) errs.date = 'Requerido'
    if (!categoryId) errs.categoryId = 'Selecciona una categoría'
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    const payload = {
      description: description.trim(),
      amount: Number(amount),
      date,
      notes: notes.trim() || undefined,
      categoryId: Number(categoryId),
    }
    if (isEdit && expenseId) {
      await updateExpense.mutateAsync({ id: expenseId, data: payload })
    } else {
      await createExpense.mutateAsync(payload)
    }
    router.push('/expenses')
  }

  const isSubmitting = createExpense.isPending || updateExpense.isPending

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4" noValidate>
      <Input
        label="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ej: Almuerzo en restaurante"
        error={errors.description}
      />
      <Input
        label="Monto (S/)"
        type="number"
        min="0.01"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        error={errors.amount}
        className="tabular-nums"
      />
      <Input
        label="Fecha"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
      />
      <Select
        label="Categoría"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        error={errors.categoryId}
      >
        <option value="">Seleccionar categoría</option>
        {categories?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Input
        label="Notas (opcional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Detalles adicionales"
      />

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => router.push('/expenses')}
        >
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" loading={isSubmitting}>
          {isEdit ? 'Actualizar' : 'Registrar'}
        </Button>
      </div>
    </form>
  )
}

export function ExpenseForm({ expenseId }: ExpenseFormProps) {
  const isEdit = expenseId != null && expenseId > 0
  const { data: expense, isLoading: loadingExpense } = useExpense(expenseId ?? 0)

  if (isEdit && loadingExpense) {
    return <div className="px-4 py-8 text-sm text-[#555]">Cargando...</div>
  }

  return <ExpenseFormInner key={expense?.id ?? 'new'} expense={expense} expenseId={expenseId} />
}
