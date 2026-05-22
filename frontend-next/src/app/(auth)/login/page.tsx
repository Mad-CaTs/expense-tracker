'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { motion } from 'framer-motion'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { login } from '@/lib/api/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token } = await login({ email, password })
      localStorage.setItem('auth_token', token)
      router.push('/expenses')
    } catch {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-[#080808] px-5">
      {/* Ambient radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,175,55,0.04) 0%, transparent 70%)',
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
          <div className="mb-3 flex items-center justify-center gap-2">
            <h1 className="text-gold text-[38px] leading-none font-extrabold tracking-[-0.04em]">
              gastos
            </h1>
          </div>
          <p className="text-[11px] tracking-[0.2em] text-[#383838] uppercase">
            control financiero personal
          </p>
        </div>

        {/* Card — double bezel */}
        <div className="rounded-[20px] border border-[#1c1c1c] bg-[#0a0a0a] p-[1px]">
          <div
            className="rounded-[19px] bg-[#0e0e0e] p-6"
            style={{
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4)',
            }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                required
              />
              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-[#ef4444]/8 px-3 py-2 text-center text-[11px] text-[#ef4444]"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}

              <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
                Iniciar sesión
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[10px] tracking-[0.12em] text-[#2a2a2a] uppercase">
          Datos protegidos localmente
        </p>
      </motion.div>
    </div>
  )
}
