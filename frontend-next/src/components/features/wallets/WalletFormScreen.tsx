'use client'

import { useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { COLOR_PRESETS } from '@/components/features/shared/colorPresets'
import { leaveNotice } from '@/components/features/shared/pendingNotice'
import { useSubPageExit } from '@/components/features/shared/useSubPageExit'
import { LeatherWallet } from '@/components/features/wallets/LeatherWallet'
import { SubPageHeader } from '@/components/layout/SubPageHeader'
import { useCreateWallet, useUpdateWallet } from '@/lib/hooks/useWallets'
import { MOTION } from '@/lib/utils/motion'
import type { Wallet } from '@/types'

/** Lo que /wallets necesita para anunciar el resultado de una acción. */
export interface WalletNotice {
  name: string
  kind: 'created' | 'updated' | 'deleted'
}

interface WalletFormScreenProps {
  /** Ausente: crear. Presente: editar esa billetera. */
  wallet?: Wallet
}

/** Desplazamiento mínimo para que el gesto cuente como cambio de color. */
const SWIPE_PX = 45


/**
 * Alta y edición de billeteras.
 *
 * El formulario ES la billetera: el nombre y el saldo se escriben donde van a
 * aparecer, y el color se elige deslizándola como en el carrusel. Con campos
 * etiquetados y una fila de fichas, se elegía el color mirando un cuadradito de
 * 34px en vez del objeto que se está creando.
 */
export function WalletFormScreen({ wallet }: WalletFormScreenProps) {
  const { exitClass, open, goBack } = useSubPageExit()
  const create = useCreateWallet()
  const update = useUpdateWallet()
  const editing = wallet != null

  const [name, setName] = useState(wallet?.name ?? '')
  const [initialBalance, setInitialBalance] = useState('')
  const [colorIndex, setColorIndex] = useState(() => {
    const i = COLOR_PRESETS.indexOf(wallet?.color ?? '')
    return i >= 0 ? i : 0
  })
  const [error, setError] = useState('')

  /** Dirección del último cambio, para que la billetera entre por el lado
   *  correcto. */
  const [dir, setDir] = useState<1 | -1>(1)
  const startX = useRef(0)
  const swiping = useRef(false)

  const color = COLOR_PRESETS[colorIndex]
  const pending = create.isPending || update.isPending

  function move(delta: 1 | -1) {
    setDir(delta)
    setColorIndex((i) => (i + delta + COLOR_PRESETS.length) % COLOR_PRESETS.length)
  }

  function onPointerDown(e: React.PointerEvent) {
    swiping.current = true
    startX.current = e.clientX
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!swiping.current) return
    swiping.current = false
    const dx = e.clientX - startX.current
    if (Math.abs(dx) < SWIPE_PX) return
    move(dx < 0 ? 1 : -1)
  }

  const preview: Wallet = {
    id: wallet?.id ?? 0,
    name: name.trim() || 'Nueva billetera',
    initialBalance: 0,
    balance: editing ? Number(wallet.balance) : parseFloat(initialBalance) || 0,
    color,
    backgroundId: wallet?.backgroundId ?? null,
  }

  async function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) { setError('Ponle un nombre a la billetera'); return }

    if (editing) {
      await update.mutateAsync({ id: wallet.id, data: { name: trimmed, color, backgroundId: wallet.backgroundId ?? null } })
    } else {
      await create.mutateAsync({
        name: trimmed,
        initialBalance: parseFloat(initialBalance) || 0,
        color,
        backgroundId: null,
      })
    }
    leaveNotice<WalletNotice>({ name: trimmed, kind: editing ? 'updated' : 'created' })
    if (editing) open(`/wallets?w=${wallet.id}`)
    else goBack()
  }

  return (
    <div className={`flex min-h-[100dvh] flex-col ${exitClass}`}>
      <SubPageHeader title={editing ? 'Editar billetera' : 'Nueva billetera'} onBack={goBack} />

      <div className="flex flex-1 flex-col justify-center pb-4">

        {/* El color se elige moviendo la billetera: se ve el cuero y la tarjeta
            teñida, no una ficha suelta. `pt` deja sitio a la tarjeta, que asoma
            por encima del cuero. */}
        <div className="enter-pop flex items-center justify-center gap-4 pb-1 pt-[52px]" style={{ ['--enter-i' as string]: 0 }}>
          <Arrow side="left" onClick={() => move(-1)} />

          <div
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => { swiping.current = false }}
            className="cursor-grab touch-pan-y select-none active:cursor-grabbing"
          >
            {/* key por color: remonta y la entrada vuelve a correr, así el cambio
                se percibe como un giro del carrusel y no como un tinte. */}
            <div key={colorIndex} className={dir === 1 ? 'step-fwd' : 'step-back'}>
              <LeatherWallet wallet={preview} width={214} />
            </div>
          </div>

          <Arrow side="right" onClick={() => move(1)} />
        </div>

        <div className="flex justify-center gap-1.5 pb-1 pt-4">
          {COLOR_PRESETS.map((c, i) => (
            <span
              key={c}
              className="h-[5px] rounded-full"
              style={{
                width: i === colorIndex ? 16 : 5,
                background: i === colorIndex ? 'var(--text-primary)' : 'var(--border-strong)',
                transition: `width ${MOTION.tint}ms var(--ease-sys), background-color ${MOTION.tint}ms var(--ease-sys)`,
              }}
            />
          ))}
        </div>

        {/* Sin nada que enmarque: se escribe donde el dato va a vivir, y la
            pista de abajo es lo que dice que se puede tocar. */}
        <div className="enter-pop px-4 pt-8 text-center" style={{ ['--enter-i' as string]: 1 }}>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder="Toca para nombrar"
            autoComplete="off"
            aria-label="Nombre de la billetera"
            className="search-input w-full bg-transparent text-center text-[22px] font-extrabold tracking-[-0.02em] outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          <p className="mt-1 text-[10.5px]" style={{ color: error ? 'var(--danger)' : 'var(--text-dim)' }}>
            {error || 'Nombre de la billetera'}
          </p>

          {/* Solo al crear: después el saldo lo determinan los movimientos, y
              editarlo descuadraría el historial. */}
          {!editing && (
            <>
              <div className="mt-5 flex items-baseline justify-center gap-1.5">
                <span className="text-[19px] font-bold" style={{ color: 'var(--text-tertiary)' }}>S/</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="0.00"
                  autoComplete="off"
                  aria-label="Saldo inicial"
                  size={Math.max(4, initialBalance.length || 4)}
                  className="search-input mono-amount bg-transparent text-center text-[30px] font-extrabold tracking-[-0.03em] tabular-nums outline-none"
                  style={{ color: parseFloat(initialBalance) > 0 ? 'var(--text-primary)' : 'var(--text-placeholder)' }}
                />
              </div>
              <p className="mt-1 text-[10.5px]" style={{ color: 'var(--text-dim)' }}>
                Saldo inicial
              </p>
            </>
          )}

        </div>
      </div>

      {/* Al pie, con el safe-area del móvil: son la salida de la pantalla y
          conviene que estén siempre en el mismo sitio, no colgando del último
          campo. */}
      <div className="flex gap-2 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <motion.button
          type="button"
          onClick={goBack}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="h-12 flex-1 cursor-pointer rounded-full text-[13px] font-semibold"
          style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
        >
          Cancelar
        </motion.button>
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="h-12 flex-[1.4] cursor-pointer rounded-full text-[13px] font-bold disabled:opacity-60"
          style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
        >
          {pending ? 'Guardando...' : editing ? 'Guardar' : 'Crear billetera'}
        </motion.button>
      </div>
    </div>
  )
}

function Arrow({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      aria-label={side === 'left' ? 'Color anterior' : 'Color siguiente'}
      className="liquid-glass-ic flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-full"
      style={{ color: 'var(--text-muted)' }}
    >
      <Icon size={15} strokeWidth={2.4} />
    </motion.button>
  )
}
