import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-12 h-12 rounded-2xl bg-[#161616] flex items-center justify-center mb-4">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#555"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-4 0v2" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-[#e2e0d5] mb-1">{title}</p>
      {description && <p className="text-xs text-[#555] max-w-[220px]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
