'use client'

import { motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'

import type { ReportSummary } from '@/types'

interface ReportSummaryCardsProps {
  summary: ReportSummary
  txType: 'expense' | 'income' | 'all'
}

const sparkData = (total: number, points = 10) => {
  const arr = []
  let v = total * 0.4
  for (let i = 0; i < points; i++) {
    v = Math.max(0, v + (Math.random() - 0.45) * total * 0.25)
    arr.push({ value: v })
  }
  arr[arr.length - 1] = { value: total }
  return arr
}

interface CardProps {
  label: string
  value: string
  sub?: string
  subPositive?: boolean
  color: string
  gradientId: string
  data: { value: number }[]
  index: number
}

function SummaryCard({ label, value, sub, subPositive, color, gradientId, data, index }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: index * 0.06, ease: [0.32, 0.72, 0, 1] }}
      className="rounded-[14px] overflow-hidden"
      style={{
        background: 'var(--bg-card-inner)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--inset-highlight)',
      }}
    >
      {/* Content */}
      <div className="px-2.5 pt-2.5 pb-1.5">
        {/* Label row */}
        <div className="flex items-center gap-1 mb-1.5">
          <div className="h-1 w-1 rounded-full flex-shrink-0" style={{ background: color }} />
          <p
            className="text-[8.5px] font-semibold uppercase tracking-[0.1em] truncate"
            style={{ color: 'var(--text-placeholder)' }}
          >
            {label}
          </p>
        </div>

        {/* Value */}
        <p
          className="mono-amount font-extrabold leading-none tracking-tight"
          style={{
            color: 'var(--text-primary)',
            fontSize: 'clamp(11px, 3.2vw, 16px)',
          }}
        >
          {value}
        </p>

        {/* Sub badge */}
        {sub && (
          <p
            className="text-[8.5px] font-semibold leading-none mt-1"
            style={{ color: subPositive ? 'var(--success)' : 'var(--danger)' }}
          >
            {sub}
          </p>
        )}
        {!sub && <div className="mt-1 h-[12px]" />}
      </div>

      {/* Sparkline flush to bottom */}
      <div className="h-8 w-full">
        <ResponsiveContainer width="100%" height={32} minWidth={1}>
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} tabIndex={-1} style={{ outline: 'none' }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`url(#${gradientId})`}
              strokeWidth={1.5}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export function ReportSummaryCards({ summary, txType }: ReportSummaryCardsProps) {
  const isIncome = txType === 'income'

  const current = isIncome ? (summary.currentIncome ?? 0) : (summary.currentTotal ?? 0)
  const previous = isIncome ? (summary.previousIncome ?? 0) : (summary.previousTotal ?? 0)
  const dailyAvg = current / Math.max(1, (() => {
    if (!summary.currentFrom || !summary.currentTo) return 1
    const d1 = new Date(summary.currentFrom), d2 = new Date(summary.currentTo)
    return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1)
  })())

  const changeRaw = previous !== 0 ? ((current - previous) / previous) * 100 : 0
  const isUp = changeRaw >= 0
  const pct = Math.abs(changeRaw).toFixed(1)

  const mainLabel = isIncome ? 'Ingresos' : 'Gastos'
  const mainColor = isIncome ? '#10b981' : '#d4af37'

  const currentData = sparkData(current)
  const anteriorData = sparkData(previous)
  const promedioData = sparkData(dailyAvg * 10)

  return (
    <div className="mb-4 grid grid-cols-3 gap-2">
      <SummaryCard
        index={0}
        label={mainLabel}
        value={`S/${current.toFixed(2)}`}
        sub={`${isUp ? '↑' : '↓'} ${pct}%`}
        subPositive={isIncome ? isUp : !isUp}
        color={mainColor}
        gradientId="gradMain"
        data={currentData}
      />
      <SummaryCard
        index={1}
        label="Anterior"
        value={`S/${previous.toFixed(2)}`}
        color="#6366f1"
        gradientId="gradAnterior"
        data={anteriorData}
      />
      <SummaryCard
        index={2}
        label="Prom. día"
        value={`S/${dailyAvg.toFixed(2)}`}
        color={isIncome ? '#d4af37' : '#10b981'}
        gradientId="gradPromedio"
        data={promedioData}
      />
    </div>
  )
}
