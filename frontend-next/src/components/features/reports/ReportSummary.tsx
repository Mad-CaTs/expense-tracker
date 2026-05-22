import type { ReportSummary as ReportSummaryType } from '@/types'

export function ReportSummary({ summary }: { summary: ReportSummaryType }) {
  const isPositive = summary.changePercent >= 0
  const budgetPct =
    summary.totalBudget > 0 ? (summary.remainingBudget / summary.totalBudget) * 100 : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
      <div className="bg-[#111] rounded-2xl p-5">
        <p className="text-xs text-[#555] uppercase tracking-widest font-semibold mb-2">
          Total gastado
        </p>
        <p className="tabular-nums text-3xl font-extrabold tracking-tight text-[#e2e0d5]">
          S/ {summary.totalAmount.toFixed(2)}
        </p>
        <p
          className="text-xs font-semibold mt-2"
          style={{ color: isPositive ? '#ef4444' : '#4ade80' }}
        >
          {isPositive ? '↑' : '↓'} {Math.abs(summary.changePercent).toFixed(1)}% vs período anterior
        </p>
      </div>

      <div className="grid grid-rows-2 gap-3">
        <div className="bg-[#111] rounded-2xl p-4">
          <p className="text-xs text-[#555] uppercase tracking-widest font-semibold mb-1">
            Presupuesto total
          </p>
          <p className="tabular-nums text-xl font-bold text-[#e2e0d5]">
            S/ {summary.totalBudget.toFixed(2)}
          </p>
        </div>
        <div className="bg-[#111] rounded-2xl p-4">
          <p className="text-xs text-[#555] uppercase tracking-widest font-semibold mb-1">
            Restante
          </p>
          <p className="tabular-nums text-xl font-bold text-[#e2e0d5]">
            S/ {summary.remainingBudget.toFixed(2)}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: budgetPct < 20 ? '#f97316' : '#555' }}
          >
            {Math.round(budgetPct)}% disponible
          </p>
        </div>
      </div>
    </div>
  )
}
