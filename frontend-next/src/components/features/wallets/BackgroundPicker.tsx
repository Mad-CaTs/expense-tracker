'use client'

import { useCardBackgrounds } from '@/lib/hooks/useCardBackgrounds'

interface BackgroundPickerProps {
  value: number | null
  onChange: (id: number | null) => void
}

export function BackgroundPicker({ value, onChange }: BackgroundPickerProps) {
  const { data: backgrounds } = useCardBackgrounds()
  const list = backgrounds ?? []

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--text-placeholder)' }}>Fondo</p>
      <div className="flex flex-wrap gap-2">
        {/* Opción Color (sin skin) */}
        <button
          onClick={() => onChange(null)}
          className="h-12 w-20 flex-shrink-0 rounded-[10px]"
          style={{
            background: 'var(--bg-input)',
            boxShadow: value === null ? '0 0 0 2px var(--bg-subtle), 0 0 0 3.5px var(--accent-light)' : '0 0 0 1px var(--border-default)',
          }}
          aria-label="Color"
        >
          <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Color</span>
        </button>

        {list.map((bg) => (
          <button
            key={bg.id}
            onClick={() => onChange(bg.id)}
            className="h-12 w-20 flex-shrink-0 overflow-hidden rounded-[10px] bg-cover bg-center"
            style={{
              backgroundImage: `url(${bg.imageUrl})`,
              boxShadow: value === bg.id ? '0 0 0 2px var(--bg-subtle), 0 0 0 3.5px var(--accent-light)' : '0 0 0 1px var(--border-default)',
            }}
            aria-label={bg.name}
            title={bg.name}
          />
        ))}
      </div>
    </div>
  )
}
