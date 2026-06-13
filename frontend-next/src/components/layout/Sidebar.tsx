'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

const NAV_ITEMS = [
  { href: '/expenses', label: 'Gastos', icon: ReceiptIcon },
  { href: '/reports', label: 'Reportes', icon: ChartIcon },
  { href: '/recurring', label: 'Recurrentes', icon: RepeatIcon },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUsername(localStorage.getItem('auth_username') ?? '')
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleLogout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_username')
    router.push('/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-col border-r px-3 py-6 md:flex" style={{ borderColor: 'var(--sidebar-border)', background: 'var(--bg-elevated)' }}>
      {/* Logo area */}
      <div className="mb-8 px-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-gold text-[22px] font-extrabold tracking-[-0.04em]">Pockr</span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[8px] font-bold tracking-[0.12em] uppercase"
            style={{
              background: 'rgba(212,175,55,0.12)',
              color: '#d4af37',
            }}
          >
            beta
          </span>
        </div>
        <p className="-mt-0.5 text-[11px] font-semibold italic" style={{ color: 'var(--text-secondary)' }}>
          Personal Money Management
        </p>
      </div>

      {/* Divider */}
      <div className="mx-3 mb-4 h-px" style={{ background: 'var(--border-subtle)' }} />

      <nav className="flex flex-1 flex-col gap-0.5" aria-label="Navegación principal">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors duration-200"
              style={{ color: active ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'var(--accent-bg)',
                    boxShadow: 'inset 0 1px 0 var(--accent-ring)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span
                className="relative transition-colors duration-200"
                style={{ color: active ? 'var(--accent)' : 'inherit' }}
              >
                <Icon size={15} />
              </span>
              <span className="relative">{label}</span>
              {active && (
                <span
                  className="absolute right-3 h-1 w-1 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom divider */}
      <div className="mx-3 mb-4 h-px" style={{ background: 'var(--border-subtle)' }} />

      {/* User menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 transition-colors cursor-pointer"
          style={{ ['--hover-bg' as string]: 'var(--bg-hover)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = '')}
        >
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ring-1" style={{ background: 'var(--bg-hover)', outline: '1px solid var(--border-default)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <p className="min-w-0 flex-1 truncate text-left text-[11px] font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
            {username || 'Mi cuenta'}
          </p>
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
              className="absolute bottom-full left-0 right-0 mb-1 rounded-xl border p-1"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)', boxShadow: 'var(--card-shadow)' }}
            >
              <button
                onClick={() => { setMenuOpen(false); router.push('/settings') }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] transition-colors cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Configuración
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] transition-colors cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444' }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cerrar sesión
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}

function ReceiptIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  )
}

function ChartIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M7 16l4-4 4 4 4-6" />
    </svg>
  )
}

function RepeatIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

