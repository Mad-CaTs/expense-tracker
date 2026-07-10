'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { AnimatePresence } from 'framer-motion'

import { DropdownMenu } from '@/components/ui/DropdownMenu'

/** Iconos Solar Bold del menú (inline, currentColor). */
function UserCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" fillRule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10m-7-3a3 3 0 1 1-6 0a3 3 0 0 1 6 0m-3 11.5a8.46 8.46 0 0 0 4.807-1.489c.604-.415.862-1.205.51-1.848C16.59 15.83 15.09 15 12 15s-4.59.83-5.318 2.163c-.351.643-.093 1.433.511 1.848A8.46 8.46 0 0 0 12 20.5" clipRule="evenodd" />
    </svg>
  )
}
function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" fillRule="evenodd" d="M16.125 12a.75.75 0 0 0-.75-.75H4.402l1.961-1.68a.75.75 0 1 0-.976-1.14l-3.5 3a.75.75 0 0 0 0 1.14l3.5 3a.75.75 0 1 0 .976-1.14l-1.96-1.68h10.972a.75.75 0 0 0 .75-.75" clipRule="evenodd" />
      <path fill="currentColor" d="M9.375 8c0 .702 0 1.053.169 1.306a1 1 0 0 0 .275.275c.253.169.604.169 1.306.169h4.25a2.25 2.25 0 0 1 0 4.5h-4.25c-.702 0-1.053 0-1.306.168a1 1 0 0 0-.275.276c-.169.253-.169.604-.169 1.306c0 2.828 0 4.243.879 5.121c.878.879 2.292.879 5.12.879h1c2.83 0 4.243 0 5.122-.879c.879-.878.879-2.293.879-5.121V8c0-2.828 0-4.243-.879-5.121S19.203 2 16.375 2h-1c-2.829 0-4.243 0-5.121.879c-.879.878-.879 2.293-.879 5.121" />
    </svg>
  )
}

/** Título contextual por ruta (el Home muestra el saludo en su lugar). */
const PAGE_TITLES: Record<string, string> = {
  '/wallets': 'Billeteras',
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
            <DropdownMenu
              align="left"
              items={[
                {
                  icon: <UserCircleIcon />,
                  label: 'Mi cuenta',
                  onClick: () => { setProfileOpen(false); router.push('/settings') },
                },
                {
                  icon: <LogoutIcon />,
                  label: 'Cerrar sesión',
                  variant: 'danger',
                  onClick: () => { setProfileOpen(false); handleLogout() },
                },
              ]}
            />
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
