'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

import { COLOR_PRESETS } from '@/components/features/shared/colorPresets'
import { ColorPickerSheet } from '@/components/ui/ColorPickerSheet'

interface CardColorPickerProps {
  value: string
  onChange: (hex: string) => void
}

/** Marca de selección compartida con `LeatherPicker`: los dos selectores del
 *  formulario deben leerse como un sistema, no como dos controles distintos. */
const RING_SELECTED = '0 0 0 2px var(--bg-base), 0 0 0 3.5px var(--accent-light)'
const RING_IDLE = '0 0 0 1px var(--lg-ic-border)'

/**
 * Color de la tarjeta metálica.
 *
 * Los 10 presets van DELANTE del picker libre a propósito: en el onboarding,
 * obligar a alguien a navegar un espectro para crear su primera billetera es
 * fricción pura. Un toque para el caso común, y el "+" para quien quiera un
 * color exacto.
 */
export function CardColorPicker({ value, onChange }: CardColorPickerProps) {
  const [picking, setPicking] = useState(false)

  // Un color que no está en la paleta solo puede venir del picker libre, así
  // que el "+" lo adopta: sin esto, elegir un color personalizado dejaba la
  // fila entera sin marcar y parecía que no se había guardado nada.
  const custom = !COLOR_PRESETS.includes(value)

  return (
    <>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
        Tarjeta
      </p>

      <div className="flex flex-wrap gap-2">
        {COLOR_PRESETS.map((hex) => {
          const selected = !custom && value === hex
          return (
            <motion.button
              key={hex}
              type="button"
              onClick={() => onChange(hex)}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              aria-label={`Color ${hex}`}
              aria-pressed={selected}
              className="h-[34px] w-[34px] flex-none cursor-pointer rounded-full"
              style={{ background: hex, boxShadow: selected ? RING_SELECTED : RING_IDLE }}
            />
          )
        })}

        <motion.button
          type="button"
          onClick={() => setPicking(true)}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          aria-label="Elegir un color personalizado"
          aria-pressed={custom}
          className="flex h-[34px] w-[34px] flex-none cursor-pointer items-center justify-center rounded-full"
          style={{
            background: custom ? value : 'var(--bg-hover)',
            boxShadow: custom ? RING_SELECTED : RING_IDLE,
            color: custom ? '#fff' : 'var(--text-muted)',
          }}
        >
          <Plus size={16} strokeWidth={2.6} />
        </motion.button>
      </div>

      {/* Montado bajo demanda: el picker no tiene prop `open`, se controla
          montándolo/desmontándolo como el resto de sheets de la app. */}
      {picking && (
        <ColorPickerSheet
          value={value}
          onChange={onChange}
          onClose={() => setPicking(false)}
          title="Color de la tarjeta"
        />
      )}
    </>
  )
}
