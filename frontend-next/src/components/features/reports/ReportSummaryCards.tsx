'use client'

import { motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'

import type { ReportSummary } from '@/types'

interface ReportSummaryCardsProps {
  summary: ReportSummary
}

const sparkData = (total: number, points = 12) => {
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.07, ease: [0.32, 0.72, 0, 1] }}
      className="rounded-[18px] border p-[1px]"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)', boxShadow: '0 4px 6px -2px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset' }}
    >
      <div
        className="flex flex-col rounded-[17px] p-4"
        style={{ background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)', minHeight: '108px' }}
      >
        {/* Label + sub badge in same row */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-placeholder)' }}>
              {label}
            </p>
          </div>
          {sub && (
            <p className="text-[10px] font-semibold flex-shrink-0" style={{ color: subPositive ? 'var(--success)' : 'var(--danger)' }}>
              {sub}
            </p>
          )}
        </div>

        {/* Value + chart — always aligned to bottom */}
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <p className="mono-amount text-[22px] font-extrabold leading-none tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {value}
            </p>
          </div>

          <div className="h-12 w-24 flex-shrink-0" style={{ outline: 'none' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }} tabIndex={-1} style={{ outline: 'none' }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Tooltip
                  cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="rounded-lg border px-2 py-1 text-[10px] font-semibold"
                          style={{ background: 'var(--bg-card-inner)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                          S/ {(payload[0].value as number).toFixed(2)}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  fill={`url(#${gradientId})`}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, fill: color, stroke: 'var(--bg-card-inner)', strokeWidth: 1.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function ReportSummaryCards({ summary }: ReportSummaryCardsProps) {
  const isUp = (summary.changePercentage ?? 0) >= 0
  const pct = Math.abs(summary.changePercentage ?? 0).toFixed(1)

  const gastoData = sparkData(summary.currentTotal ?? 0)
  const anteriorData = sparkData(summary.previousTotal ?? 0)
  const promedioData = sparkData((summary.dailyAverage ?? 0) * 10)

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SummaryCard
        index={0}
        label="Gastos"
        value={`S/ ${(summary.currentTotal ?? 0).toFixed(2)}`}
        sub={`${isUp ? '↑' : '↓'} ${pct}% vs anterior`}
        subPositive={!isUp}
        color="#d4af37"
        gradientId="gradGastos"
        data={gastoData}
      />
      <SummaryCard
        index={1}
        label="Período anterior"
        value={`S/ ${(summary.previousTotal ?? 0).toFixed(2)}`}
        color="#6366f1"
        gradientId="gradAnterior"
        data={anteriorData}
      />
      <SummaryCard
        index={2}
        label="Promedio diario"
        value={`S/ ${(summary.dailyAverage ?? 0).toFixed(2)}`}
        color="#10b981"
        gradientId="gradPromedio"
        data={promedioData}
      />
    </div>
  )
}
