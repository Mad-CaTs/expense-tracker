import { IncomeForm } from '@/components/features/incomes/IncomeForm'
import { FormBackHeader } from '@/components/features/expenses/FormBackHeader'

interface EditIncomePageProps {
  params: Promise<{ id: string }>
}

export default async function EditIncomePage({ params }: EditIncomePageProps) {
  const { id } = await params
  const incomeId = Number(id)

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-md" style={{ background: 'var(--bg-base)' }}>
      <FormBackHeader title="Editar ingreso" />
      <IncomeForm incomeId={incomeId} />
    </div>
  )
}
