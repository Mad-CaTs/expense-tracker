import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  label: string
  color?: string
  className?: string
}

export function Badge({ label, color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
        className
      )}
      style={color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {label}
    </span>
  )
}
