'use client'

import { useState } from 'react'

import { Pie, PieChart } from 'recharts'

import { ChartContainer, type ChartConfig } from '@/components/ui/pie-chart'
import type { CategoryBreakdown } from '@/types'

const FALLBACK_COLORS = [
  '#d4af37', '#c8965a', '#b87333', '#e8c547',
  '#a0845c', '#f0c060', '#8b6914', '#daa520',
  '#cd9b1d', '#e6b800',
]

function getCategoryColor(item: CategoryBreakdown, index: number): string {
  if (item.color && item.color !== '#000000' && item.color !== '') return item.color
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

interface DonutChartProps {
  breakdown: CategoryBreakdown[]
}

export function DonutChart({ breakdown }: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (!breakdown.length) return null

  const chartData = breakdown.map((item, i) => {
    const key = `cat${i}`
    return {
      ...item,
      key,
      fill: `var(--color-${key})`,
      rawColor: getCategoryColor(item, i),
    }
  })

  const chartConfig: ChartConfig = {
    total: { label: 'Total' },
    ...Object.fromEntries(
      chartData.map((d) => [d.key, { label: d.categoryName, color: d.rawColor }])
    ),
  }

  const grandTotal = breakdown.reduce((s, b) => s + (b.total ?? 0), 0)
  const activeItem = activeIndex !== null ? chartData[activeIndex] : null

  return (
    <div className="mb-4 px-4">
      <p
        className="mb-3 text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: 'var(--text-muted)' }}
      >
        Distribución
      </p>

      <div className="relative">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[240px] [&_.recharts-text]:fill-background"
        >
          <PieChart tabIndex={-1} style={{ outline: 'none' }}>
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="categoryName"
              innerRadius={60}
              outerRadius={100}
              cornerRadius={8}
              paddingAngle={4}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            />
          </PieChart>
        </ChartContainer>

        {/* Center overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {activeItem ? (
            <>
              <span
                className="text-[10px] font-semibold max-w-[72px] text-center leading-tight"
                style={{ color: 'var(--text-secondary)' }}
              >
                {activeItem.categoryName}
              </span>
              <span
                className="mono-amount mt-0.5 text-[17px] font-extrabold leading-none"
                style={{ color: activeItem.rawColor }}
              >
                {(activeItem.percentage ?? 0).toFixed(1)}%
              </span>
              <span className="mt-0.5 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                S/ {(activeItem.total ?? 0).toFixed(2)}
              </span>
            </>
          ) : (
            <>
              <span
                className="text-[9px] uppercase tracking-[0.12em]"
                style={{ color: 'var(--text-placeholder)' }}
              >
                Total
              </span>
              <span
                className="mono-amount mt-0.5 text-[16px] font-extrabold leading-none"
                style={{ color: 'var(--text-primary)' }}
              >
                S/ {grandTotal.toFixed(2)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
