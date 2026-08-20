'use client'

import { motion } from 'framer-motion'

import { useCardBackgrounds } from '@/lib/hooks/useCardBackgrounds'

interface BackgroundPickerProps {
  value: number | null
  onChange: (id: number | null) => void
}

/**
 * Fondo de la tarjeta. La primera opción es "Color", que devuelve al degradado
 * del color elegido: sin ella no habría forma de quitar una imagen ya puesta.
 */
export function BackgroundPicker({ value, onChange }: BackgroundPickerProps) {
  const { data: backgrounds = [] } = useCardBackgrounds()

  return (
    <>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
        Fondo
      </p>

      {/* -mx-4 + px-4: las miniaturas sangran hasta el borde del sheet al
          scrollear, pero arrancan alineadas con el resto de los campos. */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5" style={{ scrollbarWidth: 'none' }}>
        <motion.button
          type="button"
          onClick={() => onChange(null)}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          aria-label="Sin fondo, usar el color"
          className="liquid-glass-ic flex h-[50px] w-[78px] flex-none cursor-pointer items-center justify-center rounded-[12px] text-[10.5px] font-bold"
          style={{
            color: value === null ? 'var(--text-primary)' : 'var(--text-muted)',
            boxShadow: value === null ? '0 0 0 2px var(--bg-base), 0 0 0 3.5px var(--accent-light)' : 'none',
          }}
        >
          Color
        </motion.button>

        {backgrounds.map((bg) => (
          <motion.button
            key={bg.id}
            type="button"
            onClick={() => onChange(bg.id)}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            aria-label={bg.name}
            title={bg.name}
            className="h-[50px] w-[78px] flex-none cursor-pointer overflow-hidden rounded-[12px] bg-cover bg-center"
            style={{
              backgroundImage: `url(${bg.imageUrl})`,
              boxShadow: value === bg.id
                ? '0 0 0 2px var(--bg-base), 0 0 0 3.5px var(--accent-light)'
                : '0 0 0 1px var(--lg-ic-border)',
            }}
          />
        ))}
      </div>
    </>
  )
}
