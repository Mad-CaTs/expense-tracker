'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

export function TopBar() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUsername(localStorage.getItem('auth_username') ?? '')
  }, [])

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
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur-sm md:hidden"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--topbar-bg)' }}
    >
      {/* Logo */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[19px] font-extrabold tracking-[-0.04em]" style={{ color: 'var(--accent)' }}>
            Pockr
          </span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[8px] font-bold tracking-[0.12em] uppercase"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
          >
            beta
          </span>
        </div>
        <p className="-mt-1 text-[11px] font-semibold italic" style={{ color: 'var(--text-secondary)' }}>
          Personal Money Management
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold transition-colors cursor-pointer"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent)', outline: '1px solid var(--accent-ring)' }}
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
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)', boxShadow: 'var(--card-shadow)' }}
              >
                <button
                  onClick={() => { setProfileOpen(false); router.push('/account') }}
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
      </div>
    </header>
  )
}
