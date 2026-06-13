'use client'

import { useMemo } from 'react'

import { Pie, PieChart, Sector } from 'recharts'
import type { PieSectorShapeProps } from 'recharts/types/polar/Pie'

import type { LinkedHighlightProps } from '@/components/features/reports/DistributionSection'
import { ChartContainer, type ChartConfig } from '@/components/ui/pie-chart'
import { getCategoryColor } from '@/lib/utils/categoryColors'

const ACTIVE_RADIUS_GROWTH = 4
const DIMMED_OPACITY = 0.35

export function DonutChart({ breakdown, activeIndex, onHover, onSelect }: LinkedHighlightProps) {
  const chartData = useMemo(
    () =>
      breakdown.map((item, i) => {
        const key = `cat${i}`
        return {
          ...item,
          key,
          fill: `var(--color-${key})`,
          rawColor: getCategoryColor(item, i),
        }
      }),
    [breakdown]
  )

  const chartConfig: ChartConfig = useMemo(
    () => ({
      total: { label: 'Total' },
      ...Object.fromEntries(
        chartData.map((d) => [d.key, { label: d.categoryName, color: d.rawColor }])
      ),
    }),
    [chartData]
  )

  if (!breakdown.length) return null

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
              onMouseEnter={(_, index) => onHover(index)}
              onMouseLeave={() => onHover(null)}
              onClick={(_, index) => onSelect(index)}
              shape={(props: PieSectorShapeProps) => {
                const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, cornerRadius, fill, index } = props
                const isActive = activeIndex === index
                const isDimmed = activeIndex !== null && !isActive
                return (
                  <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={isActive ? (outerRadius ?? 0) + ACTIVE_RADIUS_GROWTH : outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    cornerRadius={cornerRadius}
                    fill={fill}
                    fillOpacity={isDimmed ? DIMMED_OPACITY : 1}
                    style={{ transition: 'fill-opacity 180ms ease', cursor: 'pointer', outline: 'none' }}
                  />
                )
              }}
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
