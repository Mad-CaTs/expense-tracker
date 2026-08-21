'use client'

import { useState } from 'react'
import { preload } from 'react-dom'

import { motion } from 'framer-motion'
import { Pencil } from 'lucide-react'

import { CardColorPicker } from '@/components/features/wallets/CardColorPicker'
import { LeatherPicker } from '@/components/features/wallets/LeatherPicker'
import { LeatherWallet } from '@/components/features/wallets/LeatherWallet'
import { CARD_SRC, LEATHERS, leatherSrc, type LeatherId } from '@/components/features/wallets/leathers'
import { Sheet, useSheetClose } from '@/components/ui/Sheet'
import { MOTION } from '@/lib/utils/motion'

interface WalletAppearanceProps {
  name?: string
  leather: LeatherId
  color: string
  onLeatherChange: (id: LeatherId) => void
  onColorChange: (hex: string) => void
}

const PREVIEW_WIDTH = 214

export function WalletAppearance({
  name,
  leather,
  color,
  onLeatherChange,
  onColorChange,
}: WalletAppearanceProps) {
  const [customizing, setCustomizing] = useState(false)

  // Los 8 cueros y la tarjeta, por adelantado. `LeatherWallet` dibuja tres
  // imágenes y el preload solo existía en el carrusel de /wallets: aquí
  // cargaban al vuelo y se veía parpadear, tanto al entrar como al cambiar de
  // acabado. Antes lo tapaba el fundido de entrada; sin él quedó a la vista.
  preload(CARD_SRC, { as: 'image' })
  for (const l of LEATHERS) preload(leatherSrc(l.id), { as: 'image' })

  return (
    <div className="flex flex-col">
      <div
        className="enter-pop-solid flex items-center justify-center pb-1 pt-[52px]"
        style={{
          ['--enter-i' as string]: 0,
          opacity: customizing ? 0 : 1,
          transition: `opacity ${MOTION.layer}ms var(--ease-sys)`,
        }}
        aria-hidden={customizing}
      >
        <LeatherWallet wallet={{ name, color, leather }} width={PREVIEW_WIDTH} />
      </div>

      {/* `enter-pop-solid`, no `enter-pop`: entra con el mismo recorrido y el
          mismo stagger que el resto del formulario, pero sin animar la opacidad
          —atenuarlo lo mezclaba con el fondo mientras entraba y al llegar a
          opacidad plena se veía apagarse. */}
      <div className="enter-pop-solid flex justify-center pt-5" style={{ ['--enter-i' as string]: 1 }}>
        <motion.button
          type="button"
          onClick={() => setCustomizing(true)}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          // Superficie OPACA, no el cristal translúcido: sobre el fondo claro el
          // blanco al 55-85% se fundía con la página en vez de destacar.
          className="flex h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-[13px] font-bold"
          style={{
            background: 'var(--surface-overlay)',
            color: 'var(--text-secondary)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <Pencil size={15} strokeWidth={2.4} aria-hidden />
          Personalizar
        </motion.button>
      </div>

      {customizing && (
        <Sheet onClose={() => setCustomizing(false)}>
          <AppearanceSheetBody
            name={name}
            leather={leather}
            color={color}
            onLeatherChange={onLeatherChange}
            onColorChange={onColorChange}
          />
        </Sheet>
      )}
    </div>
  )
}

function AppearanceSheetBody({
  name,
  leather,
  color,
  onLeatherChange,
  onColorChange,
}: WalletAppearanceProps) {
  const close = useSheetClose()

  return (
    <div className="px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-center pb-1 pt-[52px]">
        <LeatherWallet wallet={{ name, color, leather }} width={PREVIEW_WIDTH} />
      </div>

      <div className="pt-7">
        <LeatherPicker value={leather} onChange={onLeatherChange} />
      </div>

      <div className="pt-5">
        <CardColorPicker value={color} onChange={onColorChange} />
      </div>

      <motion.button
        type="button"
        onClick={close}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="mt-6 h-12 w-full cursor-pointer rounded-full text-[13px] font-bold"
        style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
      >
        Listo
      </motion.button>
    </div>
  )
}
