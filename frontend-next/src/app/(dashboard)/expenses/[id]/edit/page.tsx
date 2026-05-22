import { ExpenseForm } from '@/components/features/expenses/ExpenseForm'

interface EditExpensePageProps {
  params: Promise<{ id: string }>
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const { id } = await params
  const expenseId = Number(id)

  return (
    <div className="max-w-lg mx-auto pt-6 md:pt-8">
      <div className="px-4 mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#e2e0d5]">Editar gasto</h1>
      </div>
      <ExpenseForm expenseId={expenseId} />
    </div>
  )
}
