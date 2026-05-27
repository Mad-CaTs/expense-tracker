import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'var(--bg-input)' }}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ stroke: 'var(--text-muted)' }}
        >
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-4 0v2" />
        </svg>
      </div>
      <p className="mb-1 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{title}</p>
      {description && <p className="max-w-[220px] text-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
