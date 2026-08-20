'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

function subscribeUsername() {
  return () => {}
}

function readStoredUsername() {
  return localStorage.getItem('auth_username') ?? ''
}

function getServerUsername() {
  return ''
}

function getTodayLabel() {
  const raw = new Date().toLocaleDateString('es-PE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return raw.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export function PageHeader({ title, action }: { title?: string; action?: React.ReactNode }) {
  const router = useRouter()
  const username = useSyncExternalStore(subscribeUsername, readStoredUsername, getServerUsername)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

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
    <div className="flex items-center justify-between px-4 pt-7 pb-4 md:pt-9">
      {/* Left: title + date */}
      <div>
        <h1 className="text-[22px] font-extrabold tracking-[-0.04em]" style={{ color: 'var(--text-primary)' }}>
          {title ?? 'Inicio'}
        </h1>
        <p className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {username ? `Hola, ${username} · ` : ''}{getTodayLabel()}
        </p>
      </div>

      {/* Right: action (always visible) + profile/settings (desktop only) */}
      <div className="flex items-center gap-2">
        {action}
        <div className="hidden md:flex items-center gap-2">
          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold transition-colors"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)', boxShadow: '0 0 0 1px var(--accent-ring)' }}
              aria-label="Perfil"
            >
              {username ? username[0].toUpperCase() : '?'}
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute right-0 top-full mt-2 w-44 rounded-xl border p-1 z-50"
                  style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card-inner)', boxShadow: 'var(--card-shadow)' }}
                >
                  <div className="border-b px-3 py-2 mb-1" style={{ borderColor: 'var(--border-subtle)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-placeholder)' }}>Cuenta</p>
                    <p className="truncate text-[12px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{username.toUpperCase()}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="icon-btn icon-btn-danger flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px]"
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

          {/* Settings */}
          <button
            onClick={() => router.push('/settings')}
            className="icon-btn flex h-8 w-8 items-center justify-center rounded-full"
            aria-label="Configuración"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
