import type { CategoryBreakdown } from '@/types'

export const FALLBACK_COLORS = [
  '#d4af37', '#c8965a', '#b87333', '#e8c547',
  '#a0845c', '#f0c060', '#8b6914', '#daa520',
  '#cd9b1d', '#e6b800',
]

export function getCategoryColor(item: CategoryBreakdown, index: number): string {
  if (item.color && item.color !== '#000000' && item.color !== '') return item.color
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}
