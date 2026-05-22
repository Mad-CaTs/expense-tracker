import { EmptyState } from '@/components/ui/EmptyState'

export default function RecurringPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 md:pt-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-[#e2e0d5] mb-6">Recurrentes</h1>
      <EmptyState
        title="Sin gastos recurrentes"
        description="Próximamente podrás configurar gastos que se registran automáticamente."
      />
    </div>
  )
}
