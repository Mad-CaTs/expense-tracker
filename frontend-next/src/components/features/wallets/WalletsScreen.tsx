'use client'

import { useEffect, useRef, useState } from 'react'
import { flushSync, preload } from 'react-dom'
import { useRouter, useSearchParams } from 'next/navigation'

import { useReducedMotion } from 'framer-motion'

import { useDeleteWallet, useWallets } from '@/lib/hooks/useWallets'
import { MOTION } from '@/lib/utils/motion'
import type { Wallet } from '@/types'

import { cardFaceHTML } from './cardFace'
import { computeAdoptedCard, useWalletFlight } from './useWalletFlight'
import { LEATHER_SRC, themeForColor, WalletLeatherCarousel } from './WalletLeatherCarousel'
import { takeNotice } from '@/components/features/shared/pendingNotice'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SuccessDialog } from '@/components/ui/SuccessDialog'

import { WalletDetailPanel } from './WalletDetailPanel'
import type { WalletNotice } from './WalletFormScreen'

type Stage = 'idle' | 'opening' | 'detail' | 'closing'

const nextPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
const sleep = (ms: number) => new Promise<void>((resolve) => { window.setTimeout(resolve, ms) })

const REVEAL_OUT_MS = 300
const PANEL_OUT_MS = 280

const SAVED_TITLES: Record<WalletNotice['kind'], string> = {
  created: 'Billetera creada',
  updated: 'Billetera actualizada',
  deleted: 'Billetera eliminada',
}

const SAVED_TEXTS: Record<WalletNotice['kind'], (name: string) => string> = {
  created: (n) => `"${n}" ya está lista para tus movimientos.`,
  updated: (n) => `"${n}" se actualizó correctamente.`,
  deleted: (n) => `"${n}" y sus movimientos se eliminaron.`,
}

export function WalletsScreen() {
  preload('/brand/logo.webp', { as: 'image' })
  preload('/wallets/budget-strip.webp', { as: 'image' })
  preload('/wallets/card-flat.webp', { as: 'image' })

  const [openWallet, setOpenWallet] = useState<Wallet | null>(null)
  const [saved, setSaved] = useState<WalletNotice | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Wallet | null>(null)
  const removeWallet = useDeleteWallet()
  const [stage, setStage] = useState<Stage>('idle')
  const [settled, setSettled] = useState(false)
  const [seated, setSeated] = useState(false)
  const [adoptedCard, setAdoptedCard] = useState<{ html: string; clipPath: string } | null>(null)
  const [restored, setRestored] = useState(false)

  const stageRef = useRef<Stage>('idle')
  const screenRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const boundScrollEl = useRef<HTMLElement | null>(null)

  const reduce = useReducedMotion()
  const flight = useWalletFlight(Boolean(reduce))

  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: wallets = [] } = useWallets()
  const restoredFor = useRef<string | null>(null)
  const flightRef = useRef(flight)
  useEffect(() => { flightRef.current = flight }, [flight])

  useEffect(() => {
    const raw = searchParams.get('w')
    if (!raw) return
    if (restoredFor.current === raw) return
    if (stageRef.current !== 'idle') return
    const wallet = wallets.find((w) => String(w.id) === raw)
    if (!wallet) return

    restoredFor.current = raw
    stageRef.current = 'detail'

    queueMicrotask(() => {
      setOpenWallet(wallet)
      setStage('detail')
      setSettled(true)
      setRestored(true)
    })

    void (async () => {
      await nextPaint()
      const { current: screen } = screenRef
      const { current: panel } = panelRef
      const { current: strip } = stripRef
      const { current: slot } = slotRef
      if (!screen || !panel || !strip || !slot) return

      const screenRect = screen.getBoundingClientRect()
      screen.style.setProperty('--wd-left', `${Math.round(screenRect.left)}px`)
      screen.style.setProperty('--wd-width', `${Math.round(screenRect.width)}px`)

      const adopted = computeAdoptedCard(panel, strip, slot)
      setAdoptedCard({
        html: cardFaceHTML(wallet.color ?? '#4ade80', Number(wallet.balance), adopted.widthPx),
        clipPath: adopted.clipPath,
      })

      flightRef.current.mountSeated({
        screen,
        panel,
        strip,
        slot,
        leatherSrc: LEATHER_SRC[themeForColor(wallet.color)],
      })

      setSeated(true)
    })()
  }, [searchParams, wallets])

  useEffect(() => {
    document.body.classList.toggle('wallet-detail-open', stage !== 'idle')
    return () => document.body.classList.remove('wallet-detail-open')
  }, [stage])

  async function openDetail(wallet: Wallet, els: { walletEl: HTMLElement; cardEl: HTMLElement }) {
    if (stageRef.current !== 'idle') return
    stageRef.current = 'opening'
    setOpenWallet(wallet)
    setStage('opening')
    await nextPaint()
    const { current: screen } = screenRef
    const { current: panel } = panelRef
    const { current: strip } = stripRef
    const { current: slot } = slotRef
    if (!screen || !panel || !strip || !slot) return

    const tint = wallet.color ?? '#4ade80'
    const balance = Number(wallet.balance)

    const screenRect = screen.getBoundingClientRect()
    screen.style.setProperty('--wd-left', `${Math.round(screenRect.left)}px`)
    screen.style.setProperty('--wd-width', `${Math.round(screenRect.width)}px`)

    const adopted = computeAdoptedCard(panel, strip, slot)
    flushSync(() => {
      setAdoptedCard({
        html: cardFaceHTML(tint, balance, adopted.widthPx),
        clipPath: adopted.clipPath,
      })
    })

    await flight.open(
      {
        screen,
        panel,
        strip,
        slot,
        walletEl: els.walletEl,
        cardEl: els.cardEl,
        leatherSrc: LEATHER_SRC[themeForColor(wallet.color)],
        tint,
        balance,
      },
      () => setSettled(true),
      () => setSeated(true),
    )
    stageRef.current = 'detail'
    setStage('detail')
    restoredFor.current = String(wallet.id)
    router.replace(`/wallets?w=${wallet.id}`, { scroll: false })
  }

  async function closeDetail() {
    if (stageRef.current !== 'detail') return
    stageRef.current = 'closing'
    setStage('closing')
    setSeated(false)
    setRestored(false)

    if (flight.isActive()) {
      await flight.close(() => setSettled(false))
    } else {
      if (!reduce) await sleep(REVEAL_OUT_MS)
      setSettled(false)
      if (!reduce) await sleep(PANEL_OUT_MS)
    }

    setAdoptedCard(null)
    boundScrollEl.current = null
    stageRef.current = 'idle'
    setStage('idle')
    setOpenWallet(null)
    restoredFor.current = null
    router.replace('/wallets', { scroll: false })
  }

  async function confirmDelete() {
    const target = pendingDelete
    if (!target) return
    setPendingDelete(null)
    await closeDetail()
    await removeWallet.mutateAsync(target.id)
    setSaved({ name: target.name, kind: 'deleted' })
  }

  const screenClass = ['wd-screen relative mx-auto w-full max-w-[430px]']
  if (stage !== 'idle') screenClass.push('is-detail')
  if (settled) screenClass.push('is-settled')
  if (seated) screenClass.push('is-seated')

  useEffect(() => {
    const notice = takeNotice<WalletNotice>()
    if (!notice) return
    const t = window.setTimeout(() => setSaved(notice), MOTION.layer)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div ref={screenRef} className={screenClass.join(' ')}>
      <div className="wd-carousel">
        <WalletLeatherCarousel onOpenActive={openDetail} />
      </div>
      <ConfirmDialog
        open={pendingDelete != null}
        title="Eliminar billetera"
        description={pendingDelete
          ? `Se eliminará "${pendingDelete.name}" y sus movimientos. No se puede deshacer.`
          : undefined}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <SuccessDialog
        open={saved != null}
        title={saved ? SAVED_TITLES[saved.kind] : ''}
        description={saved ? SAVED_TEXTS[saved.kind](saved.name) : undefined}
        onClose={() => setSaved(null)}
      />

      {openWallet && (
        <WalletDetailPanel
          wallet={openWallet}
          adoptedCard={adoptedCard}
          restored={restored}
          onBack={closeDetail}
          onDelete={() => setPendingDelete(openWallet)}
          panelRef={panelRef}
          stripRef={stripRef}
          slotRef={slotRef}
          onScrollElReady={(el) => {
            if (boundScrollEl.current === el) return
            boundScrollEl.current = el
            flight.bindScroll(el)
          }}
        />
      )}
    </div>
  )
}
