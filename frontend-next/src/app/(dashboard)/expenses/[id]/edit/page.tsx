import { ExpenseForm } from '@/components/features/expenses/ExpenseForm'

interface EditExpensePageProps {
  params: Promise<{ id: string }>
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const { id } = await params
  const expenseId = Number(id)

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-[20px] border p-[1px]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
        <div className="rounded-[19px]" style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}>
          <div className="border-b px-4 py-5" style={{ borderColor: 'var(--border-subtle)' }}>
            <h1 className="text-center text-[15px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Editar gasto</h1>
          </div>
          <ExpenseForm expenseId={expenseId} />
        </div>
      </div>
    </div>
  )
}
