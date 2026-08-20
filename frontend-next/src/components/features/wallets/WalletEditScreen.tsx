'use client'

import { WalletFormScreen } from '@/components/features/wallets/WalletFormScreen'
import { useWallet } from '@/lib/hooks/useWallets'

/**
 * Carga la billetera antes de montar el formulario: sus campos se inicializan
 * en el primer render y con los datos a medias arrancaría vacío.
 */
export function WalletEditScreen({ walletId }: { walletId: number }) {
  const { data: wallet, isLoading } = useWallet(walletId)

  if (isLoading || !wallet) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
        Cargando...
      </div>
    )
  }

  return <WalletFormScreen wallet={wallet} />
}
