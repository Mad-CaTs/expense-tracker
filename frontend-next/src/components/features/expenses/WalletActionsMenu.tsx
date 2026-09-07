'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { AnimatePresence } from 'framer-motion'

import { DropdownMenu } from '@/components/ui/DropdownMenu'
import { useActiveWallet } from '@/lib/hooks/useActiveWallet'
import { useWallets } from '@/lib/hooks/useWallets'
import { useFilterStore } from '@/stores/filterStore'

import { MenuIcons } from './WalletHeaderMenuIcons'

/**
 * Acciones de la billetera activa, en la esquina superior derecha.
 *
 * Vive en la top-bar y no dentro de la tarjeta: es chrome de la pantalla, del
 * mismo rango que el botón "+" de /wallets, y encima de la tarjeta tapaba su
 * acabado y competía con el gesto de deslizar.
 */
export function WalletActionsMenu() {
  const router = useRouter()
  const walletId = useActiveWallet()
  const { data: wallets = [] } = useWallets()
  const setWalletId = useFilterStore((s) => s.setWalletId)

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const wallet = wallets.find((w) => w.id === walletId)
  if (!wallet) return null

  /* Las tres entradas de configuración fijan la billetera activa antes de
     navegar: sus pantallas filtran por ella. */
  function scopedPush(path: string) {
    setOpen(false)
    if (walletId != null) setWalletId(walletId)
    router.push(path)
  }

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Acciones de ${wallet.name}`}
        aria-expanded={open}
        className="liquid-glass flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95"
        style={{ color: 'var(--text-primary)' }}
      >
        {/* Tres puntos verticales: chrome del botón, no un ícono de dominio. */}
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <g fill="currentColor">
            <circle cx="12" cy="5" r="1.9" />
            <circle cx="12" cy="12" r="1.9" />
            <circle cx="12" cy="19" r="1.9" />
          </g>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <DropdownMenu
            align="right"
            items={[
              {
                icon: <MenuIcons.Pencil />,
                label: 'Editar',
                onClick: () => { setOpen(false); router.push(`/wallets/${wallet.id}/edit`) },
              },
              { icon: <MenuIcons.Tag />, label: 'Categorías', onClick: () => scopedPush('/categories') },
              { icon: <MenuIcons.Budget />, label: 'Presupuestos', onClick: () => scopedPush('/budgets') },
              { icon: <MenuIcons.Repeat />, label: 'Frecuentes', onClick: () => scopedPush('/recurring') },
              // Las deudas son del usuario, no de la billetera: no fija el filtro.
              { icon: <MenuIcons.Users />, label: 'Deudas', onClick: () => { setOpen(false); router.push('/debts') } },
            ]}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
