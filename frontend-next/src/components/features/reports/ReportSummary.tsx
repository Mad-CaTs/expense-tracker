import { motion } from 'framer-motion'

import type { ReportSummary as ReportSummaryType } from '@/types'

export function ReportSummary({ summary }: { summary: ReportSummaryType }) {
  const isPositive = (summary.changePercentage ?? 0) >= 0

  return (
    <div className="mb-4 grid grid-cols-5 gap-2.5">
      {/* Primary KPI — spans 3 cols */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="col-span-5 rounded-[18px] border border-[#161616] bg-[#0a0a0a] p-[1px] sm:col-span-3"
      >
        <div
          className="flex h-full flex-col justify-between rounded-[17px] bg-[#0e0e0e] p-5"
          style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.03)' }}
        >
          <p className="text-[9px] font-semibold tracking-[0.18em] text-[#383838] uppercase">
            Total gastado
          </p>
          <div>
            <p className="mono-amount mt-3 text-[32px] leading-none font-extrabold tracking-[-0.03em] text-[#e8e6db]">
              S/ {(summary.currentTotal ?? 0).toFixed(2)}
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: isPositive ? 'rgba(239,68,68,0.1)' : 'rgba(74,222,128,0.1)',
                  color: isPositive ? '#ef4444' : '#4ade80',
                }}
              >
                {isPositive ? '↑' : '↓'} {Math.abs(summary.changePercentage ?? 0).toFixed(1)}%
              </span>
              <span className="text-[10px] text-[#383838]">vs período anterior</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right column — 2 stacked cards */}
      <div className="col-span-5 flex flex-col gap-2.5 sm:col-span-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06, ease: [0.32, 0.72, 0, 1] }}
          className="rounded-[18px] border border-[#161616] bg-[#0a0a0a] p-[1px]"
        >
          <div
            className="rounded-[17px] bg-[#0e0e0e] p-4"
            style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.03)' }}
          >
            <p className="text-[9px] font-semibold tracking-[0.18em] text-[#383838] uppercase">
              Período anterior
            </p>
            <p className="mono-amount mt-1.5 text-lg font-bold text-[#c8c6bb]">
              S/ {(summary.previousTotal ?? 0).toFixed(2)}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
          className="rounded-[18px] border border-[#161616] bg-[#0a0a0a] p-[1px]"
        >
          <div
            className="rounded-[17px] bg-[#0e0e0e] p-4"
            style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.03)' }}
          >
            <p className="text-[9px] font-semibold tracking-[0.18em] text-[#383838] uppercase">
              Promedio diario
            </p>
            <p className="mono-amount mt-1.5 text-lg font-bold text-[#e8e6db]">
              S/ {(summary.dailyAverage ?? 0).toFixed(2)}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
