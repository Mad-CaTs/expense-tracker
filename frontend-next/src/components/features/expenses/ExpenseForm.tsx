'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useCategories } from '@/lib/hooks/useCategories'
import { useCreateExpense, useExpense, useUpdateExpense } from '@/lib/hooks/useExpenses'

interface ExpenseFormProps {
  expenseId?: number
}

export function ExpenseForm({ expenseId }: ExpenseFormProps) {
  const router = useRouter()
  const isEdit = expenseId != null && expenseId > 0

  const { data: expense, isLoading: loadingExpense } = useExpense(expenseId ?? 0)
  const { data: categories } = useCategories()
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (expense) {
      setDescription(expense.description)
      setAmount(expense.amount.toString())
      setDate(expense.date.split('T')[0])
      setCategoryId(expense.category.id.toString())
      setNotes(expense.notes ?? '')
    }
  }, [expense])

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

  if (isEdit && loadingExpense) {
    return <div className="px-4 py-8 text-sm text-[#555]">Cargando...</div>
  }

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
