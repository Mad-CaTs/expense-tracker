'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { AnimatePresence, motion } from 'framer-motion'

import { NavIcon, type NavIconName } from '@/components/layout/NavIcon'

const NAV_ITEMS: { href: string; label: string; icon: NavIconName }[] = [
  { href: '/expenses', label: 'Finanzas', icon: 'finanzas' },
  { href: '/wallets',  label: 'Billeteras',  icon: 'cuentas'  },
  { href: '/reports',  label: 'Reportes', icon: 'reportes' },
  { href: '/settings', label: 'Ajustes',  icon: 'cuenta'   },
]

// Un único spring para pill, layout y label → todo se mueve al unísono (sin saltos)
const SPRING = { type: 'spring' as const, stiffness: 420, damping: 38, mass: 0.9 }

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="bottomnav-host fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-4 md:hidden">
      <motion.nav
        layout
        transition={SPRING}
        className="relative flex items-center gap-1 overflow-hidden rounded-full px-2 py-2"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
        aria-label="Navegación"
      >
        {/* Aurora animada de fondo (mini-tarjeta wallet derivada del --bg-base del tema) */}
        <span className="nav-aura" aria-hidden>
          <span className="nav-blob nb1" />
          <span className="nav-blob nb2" />
          <span className="nav-blob nb3" />
          <span className="nav-blob nb4" />
        </span>

        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href)

          return (
            <motion.div key={item.href} layout transition={SPRING} className="relative z-[1]">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
                className="flex items-center rounded-full px-3.5 py-2.5"
              >
                {/* fondo del activo animado por layoutId → se desliza entre ítems */}
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    transition={SPRING}
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'var(--nav-active-bg)' }}
                  />
                )}

                <span
                  className="relative z-[1] flex-shrink-0"
                  style={{ color: active ? 'var(--nav-ink)' : 'var(--nav-ink-muted)', lineHeight: 0 }}
                >
                  <NavIcon name={item.icon} active={active} size={20} />
                </span>

                <AnimatePresence initial={false}>
                  {active && (
                    <motion.span
                      key="label"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={SPRING}
                      className="relative z-[1] overflow-hidden whitespace-nowrap"
                      style={{ color: 'var(--nav-ink)' }}
                    >
                      <span className="block pl-2 text-[12px] font-semibold">{item.label}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          )
        })}
      </motion.nav>
    </div>
  )
}
