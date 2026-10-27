'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'

import { AutoHeight } from '@/components/features/shared/AutoHeight'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Sheet, useSheetClose } from '@/components/ui/Sheet'
import { apiErrorMessage } from '@/lib/api/errors'
import { useBreakPiggyBank, useCreatePiggyBank, useRenamePiggyBank } from '@/lib/hooks/usePiggyBanks'
import { formatMoney } from '@/lib/utils/currency'
import type { PiggyBank, PiggyMovementType, Wallet } from '@/types'

import { PiggyDetail } from './PiggyDetail'
import { PiggyIcon } from './PiggyIcon'
import { PiggyList } from './PiggyList'
import { PiggyMoveForm } from './PiggyMoveForm'
import { PiggyNameForm } from './PiggyNameForm'
import { savedTotal } from './savedTotal'

type View =
  | { name: 'list' }
  | { name: 'detail'; id: number }
  | { name: 'move'; id: number; type: PiggyMovementType }
  | { name: 'create' }
  | { name: 'rename'; id: number }

/** Profundidad de cada vista: decide si el cambio desliza hacia adelante o atrás. */
const DEPTH: Record<View['name'], number> = { list: 0, create: 1, detail: 1, move: 2, rename: 2 }

export interface SavingsNotice {
  title: string
  description: string
}

interface SavingsSheetProps {
  wallet: Wallet
  piggies: PiggyBank[]
  /** El aviso de éxito se muestra DESPUÉS de que la hoja termina de bajar. */
  onAnnounce: (notice: SavingsNotice) => void
  onClosed: () => void
}

/**
 * Todo lo de las alcancías en UNA hoja que cambia de vista. Abrir una hoja
 * sobre otra apilaba fondos oscuros y el gesto de cerrar quedaba ambiguo.
 */
export function SavingsSheet({ onClosed, ...rest }: SavingsSheetProps) {
  return (
    <Sheet onClose={onClosed}>
      <SavingsFlow {...rest} />
    </Sheet>
  )
}

/* Dentro del <Sheet>: así puede cerrarlo CON su animación de salida al
   terminar, en vez de desmontarlo de golpe. */
function SavingsFlow({ wallet, piggies, onAnnounce }: Omit<SavingsSheetProps, 'onClosed'>) {
  const close = useSheetClose()
  const [view, setView] = useState<View>({ name: 'list' })
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd')
  const [breaking, setBreaking] = useState<PiggyBank | null>(null)
  const create = useCreatePiggyBank()
  const rename = useRenamePiggyBank()
  const breaker = useBreakPiggyBank()

  const piggy = 'id' in view ? piggies.find((p) => p.id === view.id) : undefined
  const money = (n: number) => formatMoney(n, wallet.currency)

  function go(next: View) {
    setDir(DEPTH[next.name] >= DEPTH[view.name] ? 'fwd' : 'back')
    setView(next)
  }
  const toList = () => go({ name: 'list' })
  const toDetail = (id: number) => go({ name: 'detail', id })

  function finish(notice: SavingsNotice) {
    onAnnounce(notice)
    close()
  }

  async function handleCreate(name: string) {
    const created = await create.mutateAsync({ walletId: wallet.id, name })
    // Sin aviso: la alcancía nueva se abre y se ve ahí mismo.
    create.refresh()
    toDetail(created.id)
  }

  function handleMoved(target: PiggyBank, type: PiggyMovementType, amount: number) {
    finish(type === 'DEPOSIT'
      ? { title: 'Guardado', description: `${money(amount)} apartados en ${target.name}. Ya no cuentan en tu saldo disponible.` }
      : { title: 'Sacado', description: `${money(amount)} de ${target.name} volvieron a tu saldo disponible.` })
  }

  async function confirmBreak() {
    if (!breaking) return
    const target = breaking
    setBreaking(null)
    try {
      await breaker.mutateAsync(target.id)
    } catch (err) {
      finish({ title: 'No se pudo romper', description: apiErrorMessage(err, 'Inténtalo de nuevo.') })
      return
    }
    finish({
      title: 'Alcancía rota',
      description: target.balance > 0
        ? `Los ${money(target.balance)} de ${target.name} volvieron a tu saldo disponible.`
        : `${target.name} se archivó.`,
    })
  }

  function content() {
    if (view.name === 'create') {
      return <PiggyNameForm title="Nueva alcancía" submitLabel="Crear" pending={create.isPending} onSubmit={handleCreate} onBack={toList} />
    }
    if (view.name === 'list' || !piggy) {
      return <PiggyList piggies={piggies} wallet={wallet} onOpen={toDetail} onCreate={() => go({ name: 'create' })} />
    }
    if (view.name === 'rename') {
      return (
        <PiggyNameForm
          title="Renombrar"
          initialName={piggy.name}
          submitLabel="Guardar"
          pending={rename.isPending}
          onSubmit={async (name) => { await rename.mutateAsync({ id: piggy.id, name }); toDetail(piggy.id) }}
          onBack={() => toDetail(piggy.id)}
        />
      )
    }
    if (view.name === 'move') {
      return (
        <PiggyMoveForm
          piggy={piggy}
          initialType={view.type}
          available={Number(wallet.balance)}
          walletId={wallet.id}
          currency={wallet.currency}
          onBack={() => toDetail(piggy.id)}
          onDone={(type, amount) => handleMoved(piggy, type, amount)}
        />
      )
    }
    return (
      <PiggyDetail
        piggy={piggy}
        walletColor={wallet.color}
        othersSaved={savedTotal(piggies) - Number(piggy.balance)}
        available={Number(wallet.balance)}
        currency={wallet.currency}
        onBack={toList}
        onMove={(type) => go({ name: 'move', id: piggy.id, type })}
        onRename={() => go({ name: 'rename', id: piggy.id })}
        onBreak={() => setBreaking(piggy)}
      />
    )
  }

  return (
    <>
      {/* Mismo deslizamiento que los pasos de un formulario, en la dirección
          en que se navega, y el alto del panel viajando a la par: un solo
          movimiento en vez de "salta el alto, después entra la vista". */}
      <AutoHeight>
        <div key={`${view.name}-${'id' in view ? view.id : ''}`} className={dir === 'fwd' ? 'step-fwd' : 'step-back'}>
          {content()}
        </div>
      </AutoHeight>

      {/* Por portal y en capa z-[60]: el panel de la hoja contiene a sus hijos
          `fixed`, y su propio portal (z-50) quedaría encima. */}
      {typeof document !== 'undefined' && createPortal(
        <div className="relative z-[60]">
          <ConfirmDialog
            open={breaking !== null}
            title={breaking ? `¿Romper ${breaking.name}?` : ''}
            description={breaking && breaking.balance > 0
              ? `Los ${money(breaking.balance)} vuelven a tu saldo disponible de ${wallet.name}.`
              : 'Está vacía: solo se archiva.'}
            confirmLabel="Romper"
            icon={<PiggyIcon size={22} />}
            onConfirm={() => { void confirmBreak() }}
            onCancel={() => setBreaking(null)}
          />
        </div>,
        document.body,
      )}
    </>
  )
}
