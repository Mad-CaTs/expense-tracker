'use client'

import { ArrowLeft } from 'lucide-react'

export function SubPageHeader({
  title,
  action,
  onBack,
}: {
  title: string
  action?: React.ReactNode
  /** Permite animar la salida antes de navegar (ver useSubPageExit). */
  onBack: () => void
}) {
  return (
    <header
      className="subpage-header sticky top-0 z-20 flex items-center justify-between gap-1 px-4 pt-5 pb-2.5"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="flex items-center gap-3">
        {/* Mismo chrome que el ← del detalle de wallet y el avatar de la top-bar:
            liquid-glass, redondo y tinta neutra. */}
        <button
          onClick={onBack}
          className="liquid-glass flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95"
          style={{ color: 'var(--text-primary)' }}
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[19px] font-extrabold tracking-[-0.01em]" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
      </div>
      {action && <div>{action}</div>}
    </header>
  )
}
