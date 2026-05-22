import { EmptyState } from '@/components/ui/EmptyState'

export default function RecurringPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 md:pt-8">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-[#e2e0d5]">Recurrentes</h1>
      <EmptyState
        title="Sin gastos recurrentes"
        description="Próximamente podrás configurar gastos que se registran automáticamente."
      />
    </div>
  )
}
