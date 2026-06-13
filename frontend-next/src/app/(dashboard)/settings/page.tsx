'use client'

import { useRouter } from 'next/navigation'

import { motion } from 'framer-motion'
import { ChevronRight, PiggyBank, Tag } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { useTheme } from '@/providers/ThemeProvider'

// ─── Theme Switch ──────────────────────────────────────────────────────────────
function ThemeSwitch() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="flex items-center justify-between py-3.5">
      <div>
        <p className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          Apariencia
        </p>
        <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-dim)' }}>
          {isDark ? 'Modo oscuro activo' : 'Modo claro activo'}
        </p>
      </div>
      <button
        onClick={toggle}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        className="relative h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer"
        style={{ background: isDark ? 'var(--accent)' : 'var(--border-strong)' }}
      >
        <motion.span
          animate={{ x: isDark ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          className="absolute top-[3px] flex h-[18px] w-[18px] items-center justify-center rounded-full"
          style={{ background: 'var(--bg-elevated)' }}
        >
          {isDark ? (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            </svg>
          ) : (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
          )}
        </motion.span>
      </button>
    </div>
  )
}

// ─── Settings Section wrapper ──────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: 'var(--text-placeholder)' }}>{label}</p>
      <div
        className="rounded-[18px] border px-4"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card-inner)', boxShadow: 'var(--inset-highlight)' }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Configuración" />
      <div className="px-4">
        {/* Theme */}
        <Section label="Apariencia">
          <ThemeSwitch />
        </Section>

        {/* Management links */}
        <Section label="Gestión">
          <button
            onClick={() => router.push('/categories')}
            className="flex w-full items-center gap-3 border-b py-3.5 text-left transition-colors cursor-pointer"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'var(--accent-bg)' }}
            >
              <Tag size={15} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>Categorías</p>
              <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-dim)' }}>Gestiona tus categorías de gasto e ingreso</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
          </button>

          <button
            onClick={() => router.push('/budgets')}
            className="flex w-full items-center gap-3 py-3.5 text-left transition-colors cursor-pointer"
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'var(--accent-bg)' }}
            >
              <PiggyBank size={15} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>Presupuestos</p>
              <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-dim)' }}>Controla tus límites de gasto por categoría</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </Section>
      </div>
    </div>
  )
}
