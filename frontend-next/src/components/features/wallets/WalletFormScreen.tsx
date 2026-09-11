'use client'

import { useEffect, useState } from 'react'

import { motion, useAnimationControls } from 'framer-motion'

import { COLOR_PRESETS } from '@/components/features/shared/colorPresets'
import { leaveNotice } from '@/components/features/shared/pendingNotice'
import { useSubPageExit } from '@/components/features/shared/useSubPageExit'
import { useFilterStore } from '@/stores/filterStore'
import { toLeatherId } from '@/components/features/wallets/leathers'
import { CurrencySignButton } from '@/components/features/wallets/CurrencySignButton'
import { WalletAppearance } from '@/components/features/wallets/WalletAppearance'
import { SubPageHeader } from '@/components/layout/SubPageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useCreateWallet, useDeleteWallet, useUpdateWallet } from '@/lib/hooks/useWallets'
import { DEFAULT_CURRENCY, type CurrencyId } from '@/lib/utils/currency'
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
  const setWalletId = useFilterStore((s) => s.setWalletId)
  const create = useCreateWallet()
  const update = useUpdateWallet()
  const remove = useDeleteWallet()
  const editing = wallet != null

  const [name, setName] = useState(wallet?.name ?? '')
  // Al editar arranca con el saldo ACTUAL (el derivado), que es el número que el
  // usuario reconoce como "lo que tengo"; el inicial es un detalle interno.
  const [balance, setBalance] = useState(wallet ? String(wallet.balance) : '')
  // El color guardado puede no estar en la paleta (viene del picker libre), así
  // que se conserva tal cual en vez de buscarlo en `COLOR_PRESETS`.
  const [color, setColor] = useState(wallet?.color ?? COLOR_PRESETS[0])
  const [leather, setLeather] = useState(() => toLeatherId(wallet?.leather))
  const [currency, setCurrency] = useState<CurrencyId>(
    (wallet?.currency as CurrencyId | undefined) ?? DEFAULT_CURRENCY,
  )
  /* Cuenta los toques al signo. El pulso del saldo se ata a él y no a
     `currency`, para que no se dispare al montar la pantalla —ahí no ha
     cambiado nada y un saldo que late solo se lee como un fallo. */
  const [currencyTaps, setCurrencyTaps] = useState(0)
  const balanceTick = useAnimationControls()

  useEffect(() => {
    if (currencyTaps === 0) return
    balanceTick.start({ scale: [1, 1.035, 1], transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } })
  }, [currencyTaps, balanceTick])
  const [error, setError] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const pending = create.isPending || update.isPending || remove.isPending

  /**
   * Elimina la billetera y todo lo que colgaba de ella.
   *
   * <p>El backend hace soft-delete y publica `WalletDeletedEvent`, así que los
   * gastos, ingresos, transferencias y deudas de esta billetera desaparecen con
   * ella. Por eso la confirmación advierte de los movimientos en vez de hablar
   * solo de la billetera.
   */
  async function handleDelete() {
    if (!wallet) return
    await remove.mutateAsync(wallet.id)
    // La billetera activa deja de existir: si no se limpia, /expenses monta
    // apuntando a un id borrado y se queda sin datos que mostrar.
    setWalletId(undefined)
    leaveNotice<WalletNotice>({ name: wallet.name, kind: 'deleted' })
    open('/wallets')
  }

  async function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) { setError('Ponle un nombre a la billetera'); return }

    if (editing) {
      // `leather` y `currency` van SIEMPRE: el PUT reemplaza el recurso entero
      // y omitirlos los pondría a null, borrando el acabado y la moneda de la
      // billetera que se edita.
      await update.mutateAsync({
        id: wallet.id,
        data: {
          name: trimmed,
          currentBalance: parseFloat(balance) || 0,
          color,
          leather,
          currency,
          backgroundId: wallet.backgroundId ?? null,
        },
      })
    } else {
      await create.mutateAsync({
        name: trimmed,
        initialBalance: parseFloat(balance) || 0,
        color,
        leather,
        currency,
        backgroundId: null,
      })
    }
    leaveNotice<WalletNotice>({ name: trimmed, kind: editing ? 'updated' : 'created' })
    // Al editar se vuelve a /expenses, que es la pantalla de la billetera: se
    // edita desde su menú y allí se ven los cambios. El destino de antes
    // (`/wallets?w=…`) abría el detalle, una pantalla que ya no existe.
    if (editing) {
      // La billetera editada pasa a ser la activa: /expenses monta mostrándola
      // a ella y no la que estuviera seleccionada antes.
      if (wallet) setWalletId(wallet.id)
      open('/expenses')
    }
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
          {/* El signo ES el selector de moneda: se toca y avanza PEN → USD →
              EUR. Está aquí y no en "Personalizar" porque la moneda no es
              decoración —decide cómo se lee cada cifra de la billetera— y
              enterrada en el sheet no se encontraba. */}
          {/* Signo y cifra van EN EL FLUJO, no anclados: así lo que se centra
              es el conjunto «S/ 1285», que es como se lee. Antes el signo iba
              absoluto para que la cifra mandara el centrado, pero eso dejaba
              el bloque entero desplazado respecto al nombre.
              `items-baseline` asienta el signo sobre la misma línea que el
              número en vez de centrarlo en una caja cuyo alto cambia con el
              contenido — que es por lo que en «crear» aparecía más arriba que
              en «editar». */}
          <motion.div
            className="mt-5 flex items-baseline justify-center gap-[3px]"
            animate={balanceTick}
          >
            <CurrencySignButton
              value={currency}
              /* Al crear nunca está fijada; al editar lo dice el backend. */
              locked={wallet?.currencyLocked ?? false}
              onChange={(c) => { setCurrency(c); setCurrencyTaps((n) => n + 1) }}
            />
            <div>
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
          </motion.div>
          <p className="mt-1 text-[10.5px]" style={{ color: 'var(--text-dim)' }}>
            {editing ? 'Saldo actual' : 'Saldo inicial'}
          </p>

          {/* Solo al editar, y separado del pie: el pie son Cancelar/Guardar,
              las dos salidas normales. Eliminar es destructivo y no debe
              quedar pegado a ellas, donde se pulsa por inercia. En texto y no
              como botón sólido por el mismo motivo. */}
          {editing && (
            <div className="mt-9 flex justify-center">
              <motion.button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={pending}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="cursor-pointer rounded-full px-4 py-2 text-[12px] font-bold disabled:opacity-60"
                style={{ color: 'var(--danger)' }}
              >
                Eliminar billetera
              </motion.button>
            </div>
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

      {/* Nombra los movimientos, no solo la billetera: el backend los borra
          con ella (WalletDeletedEvent) y es lo que de verdad se pierde. */}
      <ConfirmDialog
        open={confirmingDelete}
        title="¿Eliminar billetera?"
        description={`"${wallet?.name ?? ''}" y todos sus movimientos (gastos, ingresos, transferencias y deudas) se eliminarán.`}
        confirmLabel="Eliminar"
        onConfirm={() => { setConfirmingDelete(false); void handleDelete() }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  )
}
