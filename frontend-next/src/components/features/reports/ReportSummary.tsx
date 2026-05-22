import type { ReportSummary as ReportSummaryType } from '@/types'

export function ReportSummary({ summary }: { summary: ReportSummaryType }) {
  const isPositive = summary.changePercent >= 0
  const budgetPct =
    summary.totalBudget > 0 ? (summary.remainingBudget / summary.totalBudget) * 100 : 0

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="rounded-2xl bg-[#111] p-5">
        <p className="mb-2 text-xs font-semibold tracking-widest text-[#555] uppercase">
          Total gastado
        </p>
        <p className="text-3xl font-extrabold tracking-tight text-[#e2e0d5] tabular-nums">
          S/ {summary.totalAmount.toFixed(2)}
        </p>
        <p
          className="mt-2 text-xs font-semibold"
          style={{ color: isPositive ? '#ef4444' : '#4ade80' }}
        >
          {isPositive ? '↑' : '↓'} {Math.abs(summary.changePercent).toFixed(1)}% vs período anterior
        </p>
      </div>

      <div className="grid grid-rows-2 gap-3">
        <div className="rounded-2xl bg-[#111] p-4">
          <p className="mb-1 text-xs font-semibold tracking-widest text-[#555] uppercase">
            Presupuesto total
          </p>
          <p className="text-xl font-bold text-[#e2e0d5] tabular-nums">
            S/ {summary.totalBudget.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl bg-[#111] p-4">
          <p className="mb-1 text-xs font-semibold tracking-widest text-[#555] uppercase">
            Restante
          </p>
          <p className="text-xl font-bold text-[#e2e0d5] tabular-nums">
            S/ {summary.remainingBudget.toFixed(2)}
          </p>
          <p className="mt-1 text-xs" style={{ color: budgetPct < 20 ? '#f97316' : '#555' }}>
            {Math.round(budgetPct)}% disponible
          </p>
        </div>
      </div>
    </div>
  )
}
