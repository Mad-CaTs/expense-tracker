import { IncomeForm } from '@/components/features/incomes/IncomeForm'
import { FormBackHeader } from '@/components/features/expenses/FormBackHeader'

export default function NewIncomePage() {
  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-md" style={{ background: 'var(--bg-base)' }}>
      <FormBackHeader title="Nuevo ingreso" />
      <IncomeForm />
    </div>
  )
}
