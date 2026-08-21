'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'

import { COLOR_PRESETS } from '@/components/features/shared/colorPresets'
import { leaveNotice } from '@/components/features/shared/pendingNotice'
import { useSubPageExit } from '@/components/features/shared/useSubPageExit'
import { toLeatherId } from '@/components/features/wallets/leathers'
import { WalletAppearance } from '@/components/features/wallets/WalletAppearance'
import { SubPageHeader } from '@/components/layout/SubPageHeader'
import { useCreateWallet, useUpdateWallet } from '@/lib/hooks/useWallets'
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

/**
 * Alta y edición de billeteras.
 *
 * El formulario ES la billetera: el nombre y el saldo se escriben donde van a
 * aparecer, y el aspecto se elige viendo el resultado. `WalletAppearance` deja
 * a la vista solo el preview y un botón "Personalizar"; sus dos selectores
 * viven en un sheet, para que el nombre y el saldo no queden empujados fuera
 * de pantalla por controles que casi siempre se usan una vez.
 *
 * El campo de saldo está en el mismo sitio en ambos modos, pero significa cosas
 * distintas: al crear es el saldo inicial, y al editar el saldo actual — el
 * backend deduce el inicial que hace cuadrar los movimientos ya registrados.
 */
export function WalletFormScreen({ wallet }: WalletFormScreenProps) {
  const { exitClass, open, goBack } = useSubPageExit()
  const create = useCreateWallet()
  const update = useUpdateWallet()
  const editing = wallet != null

  const [name, setName] = useState(wallet?.name ?? '')
  // Al editar arranca con el saldo ACTUAL (el derivado), que es el número que el
  // usuario reconoce como "lo que tengo"; el inicial es un detalle interno.
  const [balance, setBalance] = useState(wallet ? String(wallet.balance) : '')
  // El color guardado puede no estar en la paleta (viene del picker libre), así
  // que se conserva tal cual en vez de buscarlo en `COLOR_PRESETS`.
  const [color, setColor] = useState(wallet?.color ?? COLOR_PRESETS[0])
  const [leather, setLeather] = useState(() => toLeatherId(wallet?.leather))
  const [error, setError] = useState('')

  const pending = create.isPending || update.isPending

  async function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) { setError('Ponle un nombre a la billetera'); return }

    if (editing) {
      // `leather` va SIEMPRE: el PUT reemplaza el recurso entero y omitirlo lo
      // pondría a null, borrando el acabado de la billetera que se edita.
      await update.mutateAsync({
        id: wallet.id,
        data: {
          name: trimmed,
          currentBalance: parseFloat(balance) || 0,
          color,
          leather,
          backgroundId: wallet.backgroundId ?? null,
        },
      })
    } else {
      await create.mutateAsync({
        name: trimmed,
        initialBalance: parseFloat(balance) || 0,
        color,
        leather,
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

        <WalletAppearance
          name={name.trim() || 'Nueva billetera'}
          leather={leather}
          color={color}
          onLeatherChange={setLeather}
          onColorChange={setColor}
        />

        {/* Sin nada que enmarque: se escribe donde el dato va a vivir, y la
            pista de abajo es lo que dice que se puede tocar. */}
        <div className="enter-pop px-4 pt-7 text-center" style={{ ['--enter-i' as string]: 2 }}>
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

          {/* Al editar también: la billetera refleja una cuenta real, y el
              usuario debe poder cuadrarla con el saldo que esa cuenta tiene hoy
              sin recalcular a mano el inicial. */}
          <div className="mt-5 flex items-baseline justify-center gap-1.5">
            <span className="text-[19px] font-bold" style={{ color: 'var(--text-tertiary)' }}>S/</span>
            <input
              type="text"
              inputMode="decimal"
              value={balance}
              onChange={(e) => setBalance(e.target.value.replace(/[^\d.]/g, ''))}
              placeholder="0.00"
              autoComplete="off"
              aria-label={editing ? 'Saldo actual' : 'Saldo inicial'}
              size={Math.max(4, balance.length || 4)}
              className="search-input mono-amount bg-transparent text-center text-[30px] font-extrabold tracking-[-0.03em] tabular-nums outline-none"
              style={{ color: parseFloat(balance) > 0 ? 'var(--text-primary)' : 'var(--text-placeholder)' }}
            />
          </div>
          <p className="mt-1 text-[10.5px]" style={{ color: 'var(--text-dim)' }}>
            {editing ? 'Saldo actual' : 'Saldo inicial'}
          </p>

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
