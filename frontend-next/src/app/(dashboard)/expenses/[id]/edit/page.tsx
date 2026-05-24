import { ExpenseForm } from '@/components/features/expenses/ExpenseForm'

interface EditExpensePageProps {
  params: Promise<{ id: string }>
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const { id } = await params
  const expenseId = Number(id)

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-[20px] border border-[#1c1c1c] bg-[#0a0a0a] p-[1px]">
        <div className="rounded-[19px] bg-[#0e0e0e]" style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04)' }}>
          <div className="border-b border-[#161616] px-4 py-5">
            <h1 className="text-center text-[15px] font-bold tracking-tight text-[#e2e0d5]">Editar gasto</h1>
          </div>
          <ExpenseForm expenseId={expenseId} />
        </div>
      </div>
    </div>
  )
}
