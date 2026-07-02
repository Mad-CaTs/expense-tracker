'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

/** Título contextual por ruta (el Home muestra el saludo en su lugar). */
const PAGE_TITLES: Record<string, string> = {
  '/wallets': 'Cuentas',
  '/reports': 'Reportes',
  '/settings': 'Configuración',
}

export function TopBar() {
  const router = useRouter()
  const pathname = usePathname()
  // Lazy init: lee localStorage una vez (guard de SSR), sin useEffect+setState.
  const [username] = useState(() =>
    typeof window !== 'undefined' ? (localStorage.getItem('auth_username') ?? '') : ''
  )
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const isHome = pathname.startsWith('/expenses')
  const pageTitle = Object.entries(PAGE_TITLES).find(([r]) => pathname.startsWith(r))?.[1]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
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
    <header
      className="relative z-30 flex items-center justify-between px-[18px] pt-5 pb-2 md:hidden"
    >
      {/* Izquierda: avatar (menú perfil) + saludo/título contextual */}
      <div ref={profileRef} className="relative flex items-center gap-[13px]">
        <button
          onClick={() => setProfileOpen((v) => !v)}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-[18px] font-bold transition-colors cursor-pointer"
          style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
          aria-label="Perfil"
        >
          {username ? username[0].toUpperCase() : '?'}
        </button>

        {isHome ? (
          <div>
            <p className="text-[13px] font-medium leading-[1.2]" style={{ color: 'var(--text-muted)' }}>Hola!</p>
            <p className="text-[19px] font-bold leading-[1.2] tracking-[-0.01em]" style={{ color: 'var(--text-primary)' }}>
              {username || '...'}
            </p>
          </div>
        ) : (
          <p className="text-[19px] font-bold tracking-[-0.01em]" style={{ color: 'var(--text-primary)' }}>
            {pageTitle ?? ''}
          </p>
        )}

        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
              className="absolute left-0 top-full mt-2 w-44 rounded-xl border p-1 z-50"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)', boxShadow: 'var(--card-shadow)' }}
            >
              <button
                onClick={() => { setProfileOpen(false); router.push('/settings') }}
                className="w-full border-b px-3 py-2 mb-1 text-left cursor-pointer rounded-t-xl transition-colors"
                style={{ borderColor: 'var(--border-subtle)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '' }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Cuenta</p>
                <p className="truncate text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>{username.toUpperCase()}</p>
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] transition-colors cursor-pointer"
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
    </header>
  )
}
