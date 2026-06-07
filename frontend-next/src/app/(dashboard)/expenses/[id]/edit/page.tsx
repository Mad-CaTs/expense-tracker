import { ExpenseForm } from '@/components/features/expenses/ExpenseForm'
import { FormBackHeader } from '@/components/features/expenses/FormBackHeader'

interface EditExpensePageProps {
  params: Promise<{ id: string }>
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const { id } = await params
  const expenseId = Number(id)

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-md" style={{ background: 'var(--bg-base)' }}>
      <FormBackHeader title="Editar gasto" />
      <ExpenseForm expenseId={expenseId} />
    </div>
  )
}
