'use client'

import { useState } from 'react'

import { CategoryBreakdown } from '@/components/features/reports/CategoryBreakdown'
import { DonutChart } from '@/components/features/reports/DonutChart'
import type { CategoryBreakdown as CategoryBreakdownType } from '@/types'

export interface LinkedHighlightProps {
  breakdown: CategoryBreakdownType[]
  activeIndex: number | null
  onHover: (index: number | null) => void
  onSelect: (index: number) => void
}

interface DistributionSectionProps {
  breakdown: CategoryBreakdownType[]
}

export function DistributionSection({ breakdown }: DistributionSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null)

  const activeIndex = hoveredIndex ?? pinnedIndex
  const handleSelect = (i: number) => {
    setPinnedIndex(prev => (prev === i ? null : i))
    setHoveredIndex(null)
  }

  if (!breakdown.length) return null

  return (
    <>
      <DonutChart
        breakdown={breakdown}
        activeIndex={activeIndex}
        onHover={setHoveredIndex}
        onSelect={handleSelect}
      />
      <CategoryBreakdown
        breakdown={breakdown}
        activeIndex={activeIndex}
        onHover={setHoveredIndex}
        onSelect={handleSelect}
      />
    </>
  )
}
