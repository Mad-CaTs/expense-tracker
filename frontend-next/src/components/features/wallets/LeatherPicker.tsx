'use client'

import { motion } from 'framer-motion'

import { LEATHERS, leatherSrc, type LeatherId } from './leathers'

interface LeatherPickerProps {
  value: LeatherId
  onChange: (id: LeatherId) => void
}

/**
 * Los 8 acabados de cuero, todos a la vista.
 *
 * Las miniaturas son la FOTO real del cuero, no una ficha de color plano: el
 * acabado es una textura, y un cuadradito teñido no dice qué billetera vas a
 * obtener. Ese era el fondo del problema del carrusel de flechas — las opciones
 * se descubrían de una en una y ninguna se veía antes de elegirla.
 *
 * La marca de selección (anillo de dos capas con `boxShadow`) es la misma que
 * usa `BackgroundPicker`, para que todos los selectores de la app se lean igual.
 */
export function LeatherPicker({ value, onChange }: LeatherPickerProps) {
  return (
    <>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
        Cuero
      </p>

      <div className="grid grid-cols-4 gap-2">
        {LEATHERS.map((leather) => {
          const selected = value === leather.id
          return (
            <motion.button
              key={leather.id}
              type="button"
              onClick={() => onChange(leather.id)}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              aria-label={leather.label}
              aria-pressed={selected}
              title={leather.label}
              className="h-[52px] w-full cursor-pointer overflow-hidden rounded-[12px]"
              style={{
                boxShadow: selected
                  ? '0 0 0 2px var(--bg-base), 0 0 0 3.5px var(--accent-light)'
                  : '0 0 0 1px var(--lg-ic-border)',
              }}
            >
              {/* `object-cover` sobre un recorte más alto que ancho: la parte
                  interesante de la textura está en el centro de la imagen, y
                  encajarla entera dejaría ver más fondo que cuero. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={leatherSrc(leather.id)}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            </motion.button>
          )
        })}
      </div>
    </>
  )
}
