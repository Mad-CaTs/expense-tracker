import { ChevronRight } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

/** Encabezado de sección: título a la izquierda + acción opcional "Ver todo →" a la derecha. */
export function SectionHeader({ title, actionLabel = 'Ver todo', onAction, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <p className="t-label uppercase tracking-[0.12em]" style={{ color: 'var(--text-placeholder)' }}>
        {title}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-0.5 text-[12px] font-semibold transition-opacity active:opacity-60 cursor-pointer"
          style={{ color: 'var(--accent-light)' }}
        >
          {actionLabel}
          <ChevronRight size={13} />
        </button>
      )}
    </div>
  )
}
