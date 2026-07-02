import { ChevronRight, MoreHorizontal } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  actionLabel?: string
  onAction?: () => void
  className?: string
  /** Estilo del título; por defecto el label pequeño en mayúsculas. */
  titleClassName?: string
  titleStyle?: React.CSSProperties
  /** Forma de la acción: texto "Ver todo →" (default) o botón circular con "···". */
  actionVariant?: 'text' | 'icon'
}

/** Encabezado de sección: título a la izquierda + acción opcional a la derecha. */
export function SectionHeader({
  title,
  actionLabel = 'Ver todo',
  onAction,
  className = '',
  titleClassName = 't-label uppercase tracking-[0.12em]',
  titleStyle = { color: 'var(--text-placeholder)' },
  actionVariant = 'text',
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <p className={titleClassName} style={titleStyle}>
        {title}
      </p>
      {onAction && (
        actionVariant === 'icon' ? (
          <button
            onClick={onAction}
            aria-label={actionLabel}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 cursor-pointer"
            style={{ background: 'var(--surface-raised)', color: 'var(--text-secondary)', boxShadow: 'var(--soft-raised-sm)' }}
          >
            <MoreHorizontal size={16} />
          </button>
        ) : (
          <button
            onClick={onAction}
            className="flex items-center gap-0.5 text-[12px] font-semibold transition-opacity active:opacity-60 cursor-pointer"
            style={{ color: 'var(--accent-light)' }}
          >
            {actionLabel}
            <ChevronRight size={13} />
          </button>
        )
      )}
    </div>
  )
}
