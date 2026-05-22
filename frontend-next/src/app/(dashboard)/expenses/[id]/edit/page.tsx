import { ExpenseForm } from '@/components/features/expenses/ExpenseForm'

interface EditExpensePageProps {
  params: Promise<{ id: string }>
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const { id } = await params
  const expenseId = Number(id)

  return (
    <div className="mx-auto max-w-lg pt-6 md:pt-8">
      <div className="mb-6 px-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#e2e0d5]">Editar gasto</h1>
      </div>
      <ExpenseForm expenseId={expenseId} />
    </div>
  )
}
