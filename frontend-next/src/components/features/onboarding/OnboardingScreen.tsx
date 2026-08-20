'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { INTRO_SLIDES } from '@/components/features/onboarding/introSlides'
import { markOnboardingSeen, useHasSeenOnboarding } from '@/components/features/onboarding/onboardingState'
import { completeOnboarding } from '@/lib/api/auth'
import { COLOR_PRESETS } from '@/components/features/shared/colorPresets'
import { LeatherWallet } from '@/components/features/wallets/LeatherWallet'
import { SuccessDialog } from '@/components/ui/SuccessDialog'
import { useCreateWallet } from '@/lib/hooks/useWallets'
import { MOTION } from '@/lib/utils/motion'
import type { Wallet } from '@/types'

const SWIPE_PX = 45
const FORM_STEP = INTRO_SLIDES.length

export function OnboardingScreen() {
  const router = useRouter()
  const create = useCreateWallet()


  const seenBefore = useHasSeenOnboarding()
  const [picked, setPicked] = useState<number | null>(null)

  const step = picked ?? (seenBefore ? FORM_STEP : 0)
  const setStep = setPicked
  const [name, setName] = useState('')
  const [initialBalance, setInitialBalance] = useState('')
  const [colorIndex, setColorIndex] = useState(3)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState<string | null>(null)

  const [dir, setDir] = useState<1 | -1>(1)
  const startX = useRef(0)
  const swiping = useRef(false)

  const color = COLOR_PRESETS[colorIndex]
  const onForm = step === FORM_STEP
  const formOnly = seenBefore && onForm

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
    id: 0,
    name: name.trim() || 'Mi billetera',
    initialBalance: 0,
    balance: parseFloat(initialBalance) || 0,
    color,
    backgroundId: null,
  }

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Ponle un nombre a la billetera')
      return
    }
    await create.mutateAsync({
      name: trimmed,
      initialBalance: parseFloat(initialBalance) || 0,
      color,
      backgroundId: null,
    })

    markOnboardingSeen()
    try {
      await completeOnboarding()
    } catch {
    }

    setSaved(trimmed)
  }


  function finish() {
    setSaved(null)
    router.replace('/expenses')
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-[430px] flex-col">
      {/* Ventana del carrusel: los slides viven en una fila que se desplaza. El
          overflow-hidden es lo que convierte la fila en una ventana de uno. */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* `w-full` en el track y NO `flex-1`: un contenedor flex se dimensiona
            por su contenido, así que con los slides a `w-full` crecía hasta la
            suma de todos (1365px en una pantalla de 400) y cada slide quedaba
            más ancho que la ventana. Fijado al ancho de la ventana, `w-full` en
            cada slide vale exactamente una pantalla y el -100% desplaza uno. */}
        <div
          className="flex w-full min-h-0 flex-none"
          style={{
            transform: `translate3d(-${step * 100}%, 0, 0)`,
            transition: `transform ${MOTION.travel}ms var(--ease-sys)`,
          }}
        >
          {INTRO_SLIDES.map((slide) => (
            <div key={slide.title} className="flex w-full flex-none flex-col px-[26px]">
              <div className="flex min-h-0 flex-1 items-center justify-center pb-2 pt-5">
                {slide.art}
              </div>
              <div className="flex-none pb-2 text-center">
                <h1 className="mb-2.5 text-[25px] font-extrabold leading-[1.15] tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>
                  {slide.title}
                </h1>
                <p className="mx-auto max-w-[300px] text-[13.5px] leading-[1.6]" style={{ color: 'var(--text-tertiary)' }}>
                  {slide.text}
                </p>
              </div>
            </div>
          ))}

          {/* Último slide: el formulario. */}
          <div className="flex w-full flex-none flex-col justify-center px-[26px]">
            <div className="flex flex-none flex-col items-center justify-center pt-[46px]">
              <div className="flex items-center justify-center gap-4">
                <Arrow side="left" onClick={() => move(-1)} />
                <div
                  onPointerDown={onPointerDown}
                  onPointerUp={onPointerUp}
                  onPointerCancel={() => { swiping.current = false }}
                  className="cursor-grab touch-pan-y select-none active:cursor-grabbing"
                >
                  {/* key por color: remonta y la entrada vuelve a correr, así el
                      cambio se percibe como un giro del carrusel, no un tinte. */}
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
              <div className="w-full pt-5 text-center">
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
              </div>

              <p className="mx-auto max-w-[300px] pt-4 text-center text-[13.5px] leading-[1.6]" style={{ color: 'var(--text-tertiary)' }}>
                Desliza la billetera o usa las flechas para elegir su color.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progreso: incluye el paso del formulario, así se ve cuánto falta. Con
          un solo paso no hay recorrido que mostrar. */}
      <div className={`flex flex-none justify-center gap-1.5 pb-2.5 pt-3.5${formOnly ? ' invisible' : ''}`}>
        {Array.from({ length: FORM_STEP + 1 }, (_, i) => (
          <span
            key={i}
            className="h-[5px] rounded-full"
            style={{
              width: i === step ? 17 : 5,
              background: i === step ? 'var(--text-primary)' : 'var(--border-strong)',
              transition: `width ${MOTION.tint}ms var(--ease-sys), background-color ${MOTION.tint}ms var(--ease-sys)`,
            }}
          />
        ))}
      </div>

      <div className="flex flex-none items-center gap-2.5 px-[22px] pb-[max(1.6rem,env(safe-area-inset-bottom))]">
        {step > 0 && !formOnly && (
          <motion.button
            type="button"
            onClick={() => setStep(step - 1)}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`h-[50px] cursor-pointer rounded-full text-[13.5px] font-bold ${onForm ? 'flex-1' : 'px-4'}`}
            style={onForm
              ? { background: 'var(--bg-hover)', color: 'var(--text-secondary)' }
              : { color: 'var(--text-muted)' }}
          >
            Atrás
          </motion.button>
        )}
        <motion.button
          type="button"
          onClick={onForm ? handleCreate : () => setStep(step + 1)}
          disabled={create.isPending}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="h-[50px] flex-1 cursor-pointer rounded-full text-[13.5px] font-extrabold disabled:opacity-60"
          style={{ background: 'var(--accent-light)', color: 'var(--bg-base)' }}
        >
          {create.isPending
            ? 'Creando...'
            : onForm
              ? 'Crear billetera'
              : step === FORM_STEP - 1
                ? 'Crear mi billetera'
                : 'Continuar'}
        </motion.button>
      </div>

      <SuccessDialog
        open={saved != null}
        title="Billetera creada"
        description={saved ? `"${saved}" ya está lista para tus movimientos.` : undefined}
        onClose={finish}
      />
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
