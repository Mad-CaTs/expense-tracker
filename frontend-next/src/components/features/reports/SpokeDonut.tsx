'use client'

import { useMemo, useRef } from 'react'

import { useCountUp } from '@/components/features/shared/useCountUp'
import { categorySwatch } from '@/lib/utils/cardVisuals'
import { getCategoryColor } from '@/lib/utils/categoryColors'
import type { CategoryBreakdown } from '@/types'

const SPOKES = 60
const R_IN = 62
const R_OUT = 92
const SIZE = 222
const C = SIZE / 2

const ACTIVE_REACH = 14

const SWEEP_MS = 460

interface SpokeDonutProps {
  breakdown: CategoryBreakdown[]
  activeIndex: number | null
  onSelect: (index: number) => void
  label: string
}

interface Spoke {
  angle: number
  color: string
  index: number
}

export function SpokeDonut({ breakdown, activeIndex, onSelect, label }: SpokeDonutProps) {
  const svg = useRef<SVGSVGElement>(null)

  const total = breakdown.reduce((sum, b) => sum + (b.total ?? 0), 0)
  const shownTotal = useCountUp(total)

  const spokes = useMemo<Spoke[]>(() => {
    if (total <= 0) return []
    const out: Spoke[] = []
    let i = 0

    breakdown.forEach((item, index) => {
      const count = Math.round(SPOKES * (item.total ?? 0) / total)
      if (count === 0) return
      const hue = hueOf(getCategoryColor(item, index))

      for (let k = 0; k < count; k++, i++) {
        const t = count > 1 ? k / (count - 1) : 0
        out.push({
          angle: (i / SPOKES) * Math.PI * 2 - Math.PI / 2,
          color: `hsl(${hue} 42% ${54 - t * 14}%)`,
          index,
        })
      }
    })
    return out
  }, [breakdown, total])

  const sweepKey = useMemo(
    () => breakdown.map((b) => `${b.categoryName}:${b.total ?? 0}`).join('|'),
    [breakdown]
  )

  function handlePointer(e: React.PointerEvent<SVGSVGElement>) {
    const box = svg.current?.getBoundingClientRect()
    if (!box || total <= 0) return
    const x = ((e.clientX - box.left) / box.width) * SIZE - C
    const y = ((e.clientY - box.top) / box.height) * SIZE - C

    const dist = Math.hypot(x, y)
    if (dist < R_IN * 0.6 || dist > R_OUT * 1.25) return

    let angle = Math.atan2(y, x) + Math.PI / 2
    if (angle < 0) angle += Math.PI * 2
    const fraction = angle / (Math.PI * 2)

    let acc = 0
    for (let i = 0; i < breakdown.length; i++) {
      acc += (breakdown[i].total ?? 0) / total
      if (fraction <= acc) { onSelect(i); return }
    }
  }

  if (!breakdown.length) return null

  return (
    <div className="flex justify-center pb-1 pt-1.5">
      <svg
        ref={svg}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        onPointerDown={handlePointer}
        role="img"
        aria-label={`${label}: ${breakdown.map((b) => `${b.categoryName} ${Math.round(b.percentage ?? 0)}%`).join(', ')}`}
      >
        {spokes.map((s, i) => {
          const active = activeIndex === s.index
          const cos = Math.cos(s.angle)
          const sin = Math.sin(s.angle)
          return (
            <line
              key={`${sweepKey}#${i}`}
              className="spoke-in"
              x1={C + cos * R_IN}
              y1={C + sin * R_IN}
              x2={C + cos * R_OUT}
              y2={C + sin * R_OUT}
              stroke={s.color}
              strokeWidth={4.6}
              strokeLinecap="round"
              opacity={activeIndex === null || active ? 1 : 0.25}
              transform={active ? `translate(${cos * ACTIVE_REACH} ${sin * ACTIVE_REACH})` : undefined}
              style={{
                ['--spoke-i' as string]: i,
                ['--spoke-step' as string]: `${(SWEEP_MS / spokes.length).toFixed(1)}ms`,
                transition: 'opacity var(--dur-tint) var(--ease-sys), transform var(--dur-layer) var(--ease-sys)',
              }}
            />
          )
        })}

        <text
          x={C} y={C - 8}
          textAnchor="middle"
          className="text-[9.5px] font-bold uppercase tracking-[0.1em]"
          fill="var(--text-tertiary)"
        >
          {label}
        </text>
        <text
          x={C} y={C + 18}
          textAnchor="middle"
          className="mono-amount text-[23px] font-extrabold tabular-nums"
          fill="var(--text-primary)"
        >
          S/ {shownTotal.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
        </text>
      </svg>
    </div>
  )
}

function hueOf(color: string): number {
  const swatch = categorySwatch(color)
  const match = /^hsl\((\d+(?:\.\d+)?)/.exec(swatch)
  return match ? Number(match[1]) : 45
}
