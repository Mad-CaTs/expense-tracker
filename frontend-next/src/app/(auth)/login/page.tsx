'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { login } from '@/lib/api/auth'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [errorKey, setErrorKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { accessToken } = await login({ username, password })
      localStorage.setItem('auth_token', accessToken)
      localStorage.setItem('auth_username', username)
      router.push('/expenses')
    } catch {
      setError('Usuario o contraseña incorrectos')
      setErrorKey((k) => k + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center px-5" style={{ background: 'var(--bg-base)' }}>
      {/* Ambient radial glow */}
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
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="mb-1 flex items-center justify-center gap-2">
            <h1 className="text-gold text-[38px] leading-none font-extrabold tracking-[-0.04em]">
              Pockr
            </h1>
            <span
              className="rounded-full px-1.5 py-0.5 text-[8px] font-bold tracking-[0.12em] uppercase"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
            >
              beta
            </span>
          </div>
          <p className="text-[11px] font-semibold italic" style={{ color: 'var(--text-secondary)' }}>
            Personal Money Management
          </p>
        </div>

        {/* Card — double bezel */}
        <div className="rounded-[20px] border p-[1px]" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-subtle)' }}>
          <div
            className="rounded-[19px] p-6"
            style={{ background: 'var(--bg-elevated)', boxShadow: 'var(--inset-highlight)' }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <Input
                label="Usuario"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="tu usuario"
                autoComplete="username"
                required
              />
              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="transition-colors" style={{ color: 'var(--text-muted)' }}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
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
                }
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
                Iniciar sesión
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[10px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-dim)' }}>
          Datos protegidos localmente
        </p>
      </motion.div>
    </div>
  )
}
