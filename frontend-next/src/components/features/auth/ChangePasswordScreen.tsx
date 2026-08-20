'use client'

import { useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'

import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { changePassword } from '@/lib/api/auth'

/** El backend exige @Size(min = 6) en la contraseña nueva. */
const MIN_LENGTH = 6

/**
 * Si el cambio es obligatorio, según la marca que dejó el login.
 *
 * `useSyncExternalStore` y no `useState`: localStorage no existe en el
 * servidor, y sembrarlo en el estado inicial haría que servidor y cliente
 * renderizaran árboles distintos. El snapshot del servidor es `true` —el caso
 * forzado— para no ofrecer un "Cancelar" que parpadee y desaparezca.
 */
function useForcedChange(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => localStorage.getItem('auth_must_change') === 'true',
    () => true,
  )
}

/**
 * Cambio de contraseña.
 *
 * Se llega por dos caminos y el texto sirve a ambos: forzado tras entrar con la
 * clave temporal —mientras `mustChangePassword` siga activo el backend emite un
 * token con scope `password_change` y TODA otra petición responde 403—, o a
 * voluntad desde Configuración.
 */
export function ChangePasswordScreen() {
  const router = useRouter()
  /**
   * Forzado (clave temporal) vs. voluntario (desde Configuración).
   *
   * Solo el forzado deja el token con scope restringido, así que es el único
   * sin salida: sin cambiarla, la app no funciona. El voluntario necesita poder
   * cancelar y volver a Configuración, no aterrizar en /expenses.
   */
  const forced = useForcedChange()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [errorKey, setErrorKey] = useState(0)
  const [loading, setLoading] = useState(false)

  function fail(message: string) {
    setError(message)
    setErrorKey((k) => k + 1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (next.length < MIN_LENGTH) {
      fail(`La contraseña nueva debe tener al menos ${MIN_LENGTH} caracteres`)
      return
    }
    if (next !== repeat) {
      fail('Las contraseñas no coinciden')
      return
    }
    if (next === current) {
      fail('La contraseña nueva debe ser distinta de la actual')
      return
    }

    setLoading(true)
    try {
      const { accessToken, refreshToken } = await changePassword({ currentPassword: current, newPassword: next })
      localStorage.setItem('auth_token', accessToken)
      localStorage.setItem('auth_refresh', refreshToken)
      // Al cambiarla deja de ser obligatorio; sin limpiar la marca, volver a
      // entrar acá desde Configuración se comportaría como el caso forzado.
      localStorage.removeItem('auth_must_change')
      // `replace`: volver atrás llevaría a un formulario que ya no aplica.
      router.replace(forced ? '/expenses' : '/settings')
    } catch {
      fail('La contraseña actual no es correcta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center px-5" style={{ background: 'var(--bg-base)' }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(160,160,170,0.05) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-full max-w-[360px]"
      >
        <div className="mb-8 text-center">
          <h1 className="mb-1.5 text-[23px] font-extrabold tracking-[-0.03em]" style={{ color: 'var(--text-primary)' }}>
            Cambiar contraseña
          </h1>
          <p className="mx-auto max-w-[290px] text-[12px] leading-[1.55]" style={{ color: 'var(--text-tertiary)' }}>
            Escribe tu contraseña actual y elige una nueva.
          </p>
        </div>

        <div className="rounded-[20px] border p-[1px]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
          <div
            className="rounded-[19px] p-6"
            style={{ background: 'var(--bg-elevated)', boxShadow: 'var(--inset-highlight)' }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <Input
                label="Contraseña actual"
                type={show ? 'text' : 'password'}
                value={current}
                onChange={(e) => { setCurrent(e.target.value); setError('') }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                suffix={<EyeToggle shown={show} onToggle={() => setShow((v) => !v)} />}
              />
              <Input
                label="Contraseña nueva"
                type={show ? 'text' : 'password'}
                value={next}
                onChange={(e) => { setNext(e.target.value); setError('') }}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                required
              />
              <Input
                label="Repite la nueva"
                type={show ? 'text' : 'password'}
                value={repeat}
                onChange={(e) => { setRepeat(e.target.value); setError('') }}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />

              <AnimatePresence mode="wait">
                {error && (
                  <motion.p
                    key={errorKey}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl bg-[#ef4444]/8 px-3 py-2 text-center text-[11px] text-[#ef4444]"
                    role="alert"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
                {forced ? 'Guardar y continuar' : 'Guardar'}
              </Button>

              {/* Solo cuando hay a dónde volver: con la clave temporal sin
                  cambiar, el token está restringido y la app no funciona. */}
              {!forced && (
                <button
                  type="button"
                  onClick={() => router.replace('/settings')}
                  className="cursor-pointer text-[12.5px] font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Cancelar
                </button>
              )}
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>
          Se cerrarán tus otras sesiones
        </p>
      </motion.div>
    </div>
  )
}

function EyeToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="transition-colors"
      style={{ color: 'var(--text-muted)' }}
      aria-label={shown ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
    >
      {shown ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  )
}
