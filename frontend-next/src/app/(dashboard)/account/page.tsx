'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { motion } from 'framer-motion'

import { AccountIcon } from '@/components/features/account/AccountIcon'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ListRow } from '@/components/ui/ListRow'
import { useTheme } from '@/providers/ThemeProvider'

function ThemeToggleRow() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      className="flex w-full items-center gap-3 px-2 py-3 rounded-[var(--r-md)] cursor-pointer transition-colors"
      onClick={toggle}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--r-sm)]"
        style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
      >
        <AccountIcon name={isDark ? 'moon' : 'sun'} size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="t-body" style={{ color: 'var(--text-primary)' }}>Apariencia</p>
        <p className="t-caption" style={{ color: 'var(--text-muted)' }}>
          {isDark ? 'Modo oscuro activo' : 'Modo claro activo'}
        </p>
      </div>

      <button
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        onClick={(e) => { e.stopPropagation(); toggle() }}
        className="relative h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer flex-shrink-0"
        style={{ background: isDark ? 'var(--accent)' : 'var(--border-strong)' }}
      >
        <motion.span
          animate={{ x: isDark ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          className="absolute top-[3px] flex h-[18px] w-[18px] items-center justify-center rounded-full"
          style={{ background: 'var(--bg-elevated)' }}
        />
      </button>
    </div>
  )
}

export default function AccountPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')

  useEffect(() => {
    setUsername(localStorage.getItem('auth_username') ?? '')
  }, [])

  function handleLogout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_username')
    router.push('/login')
  }

  return (
    <div className="mx-auto max-w-3xl pt-6 pb-8">

      {/* Avatar + nombre */}
      <div className="px-4 mb-8 flex items-center gap-4">
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-[22px] font-bold"
          style={{ background: 'var(--accent-bg)', color: 'var(--accent)', outline: '2px solid var(--accent-ring)' }}
        >
          {username ? username[0].toUpperCase() : '?'}
        </div>
        <div>
          <p className="t-title" style={{ color: 'var(--text-primary)' }}>{username}</p>
          <p className="t-caption" style={{ color: 'var(--text-muted)' }}>Cuenta personal</p>
        </div>
      </div>

      {/* Apariencia */}
      <div className="px-4 mb-2">
        <SectionHeader title="Apariencia" />
      </div>
      <div className="px-2 mb-6">
        <ThemeToggleRow />
      </div>

      {/* Gestión */}
      <div className="px-4 mb-2">
        <SectionHeader title="Gestión" />
      </div>
      <div className="px-2 mb-6">
        <ListRow
          renderIcon={<AccountIcon name="tag" size={18} />}
          color="var(--accent)"
          title="Categorías"
          subtitle="Gestiona tus categorías de gasto e ingreso"
          trailing={<span style={{ color: 'var(--text-muted)' }}><AccountIcon name="chevron" size={16} /></span>}
          onClick={() => router.push('/categories')}
          index={0}
        />
        <ListRow
          renderIcon={<AccountIcon name="chart-square" size={18} />}
          color="var(--accent)"
          title="Presupuestos"
          subtitle="Controla tus límites de gasto por categoría"
          trailing={<span style={{ color: 'var(--text-muted)' }}><AccountIcon name="chevron" size={16} /></span>}
          onClick={() => router.push('/budgets')}
          index={1}
        />
        <ListRow
          renderIcon={<AccountIcon name="calendar-mark" size={18} />}
          color="var(--accent)"
          title="Recurrentes"
          subtitle="Gastos que se repiten cada mes"
          trailing={<span style={{ color: 'var(--text-muted)' }}><AccountIcon name="chevron" size={16} /></span>}
          onClick={() => router.push('/recurring')}
          index={2}
        />
      </div>

      {/* Sesión */}
      <div className="px-4 mb-2">
        <SectionHeader title="Sesión" />
      </div>
      <div className="px-2">
        <ListRow
          renderIcon={<AccountIcon name="exit" size={18} />}
          color="#ef4444"
          title="Cerrar sesión"
          onClick={handleLogout}
          index={0}
        />
      </div>

    </div>
  )
}
