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
    <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d] px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="w-full max-w-sm"
      >
        <div className="mb-10 text-center">
          <h1 className="text-gold mb-1 text-4xl font-extrabold tracking-tight">gastos</h1>
          <p className="text-sm text-[#555]">Control de gastos personales</p>
        </div>

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
            <p className="text-center text-xs text-[#ef4444]" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
            Iniciar sesión
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
