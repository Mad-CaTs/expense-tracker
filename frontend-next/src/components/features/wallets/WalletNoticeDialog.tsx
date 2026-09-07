'use client'

import { useEffect, useState } from 'react'

import { takeNotice } from '@/components/features/shared/pendingNotice'
import { SuccessDialog } from '@/components/ui/SuccessDialog'
import { MOTION } from '@/lib/utils/motion'

import type { WalletNotice } from './WalletFormScreen'

const TITLES: Record<WalletNotice['kind'], string> = {
  created: 'Billetera creada',
  updated: 'Billetera actualizada',
  deleted: 'Billetera eliminada',
}

const TEXTS: Record<WalletNotice['kind'], (name: string) => string> = {
  created: (n) => `"${n}" ya está lista para tus movimientos.`,
  updated: (n) => `"${n}" se actualizó correctamente.`,
  deleted: (n) => `"${n}" y sus movimientos se eliminaron.`,
}

/**
 * Anuncia el resultado de crear, editar o eliminar una billetera.
 *
 * Lo monta la pantalla a la que se vuelve tras la acción — /wallets al crear,
 * /expenses al editar — porque el aviso lo deja el formulario y lo recoge quien
 * llega después. Se retrasa `MOTION.layer` para no pisar la entrada de la
 * pantalla que acaba de montar.
 */
export function WalletNoticeDialog() {
  const [saved, setSaved] = useState<WalletNotice | null>(null)

  useEffect(() => {
    const notice = takeNotice<WalletNotice>()
    if (!notice) return
    const t = window.setTimeout(() => setSaved(notice), MOTION.layer)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <SuccessDialog
      open={saved != null}
      title={saved ? TITLES[saved.kind] : ''}
      description={saved ? TEXTS[saved.kind](saved.name) : undefined}
      onClose={() => setSaved(null)}
    />
  )
}
