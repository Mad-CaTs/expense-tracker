'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { AnimatedAmount } from '@/components/features/shared/AnimatedAmount'
import { SuccessDialog } from '@/components/ui/SuccessDialog'
import { usePiggyBanks, useSavingsRefresh } from '@/lib/hooks/usePiggyBanks'
import { symbolOf } from '@/lib/utils/currency'
import type { Wallet } from '@/types'

import { PiggyIcon } from './PiggyIcon'
import { SavingsSheet, type SavingsNotice } from './SavingsSheet'
import { savedTotal } from './savedTotal'

interface SavingsChipProps {
  wallet: Wallet
  /** Saldo oculto (ojo tachado): lo apartado se oculta con él. */
  hidden: boolean
}

/**
 * Etiqueta de la tarjeta con lo apartado en alcancías; al tocarla abre la hoja.
 *
 * Vive junto al saldo porque es donde se busca: el número grande ya es el
 * DISPONIBLE, y esto dice cuánto más hay guardado aparte.
 */
export function SavingsChip({ wallet, hidden }: SavingsChipProps) {
  const { data: piggies = [] } = usePiggyBanks(wallet.id)
  const refresh = useSavingsRefresh()

  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState<SavingsNotice | null>(null)
  /* El aviso espera a que la hoja termine de bajar: aparecer mientras todavía
     se desliza era lo que se veía como un corte. */
  const pending = useRef<SavingsNotice | null>(null)

  function handleClosed() {
    setOpen(false)
    const next = pending.current
    pending.current = null
    if (next) requestAnimationFrame(() => setNotice(next))
  }

  /* Los saldos se refrescan al cerrar el aviso, no antes: si cambian detrás
     del modal, el número se mueve mientras lo lees. */
  function closeNotice() {
    setNotice(null)
    refresh()
  }

  return (
    <>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); setOpen(true) }}
        className="flex h-7 cursor-pointer items-center gap-1.5 self-start rounded-full pl-2 pr-2.5 text-[12px] font-bold tabular-nums transition-transform active:scale-95"
        style={{ background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(6px)', color: '#fff' }}
      >
        <PiggyIcon size={15} />
        {piggies.length === 0 ? 'Alcancías' : hidden ? '•••• apartado' : (
          <span>
            {symbolOf(wallet.currency)} <AnimatedAmount value={savedTotal(piggies)} /> apartado
          </span>
        )}
        <span aria-hidden style={{ opacity: 0.7 }}>›</span>
      </button>

      {open && (
        <SavingsSheet
          wallet={wallet}
          piggies={piggies}
          onAnnounce={(n) => { pending.current = n }}
          onClosed={handleClosed}
        />
      )}

      {/* Por portal: la tarjeta se transforma con el gesto de deslizar, y un
          `fixed` dentro de un ancestro transformado se ancla a él y no a la
          pantalla. */}
      {typeof document !== 'undefined' && createPortal(
        <div className="relative z-[60]">
          <SuccessDialog open={notice !== null} title={notice?.title ?? ''} description={notice?.description} onClose={closeNotice} />
        </div>,
        document.body,
      )}
    </>
  )
}
