import { WalletEditScreen } from '@/components/features/wallets/WalletEditScreen'

interface EditWalletPageProps {
  params: Promise<{ id: string }>
}

export default async function EditWalletPage({ params }: EditWalletPageProps) {
  const { id } = await params

  return (
    <div className="mx-auto min-h-[100dvh] max-w-3xl">
      <WalletEditScreen walletId={Number(id)} />
    </div>
  )
}
