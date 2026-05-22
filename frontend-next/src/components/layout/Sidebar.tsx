'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { href: '/expenses', label: 'Gastos', icon: ReceiptIcon },
  { href: '/budgets', label: 'Presupuestos', icon: WalletIcon },
  { href: '/reports', label: 'Reportes', icon: ChartIcon },
  { href: '/recurring', label: 'Recurrentes', icon: RepeatIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-col border-r border-[#161616] bg-[#0e0e0e] px-3 py-6 md:flex">
      {/* Logo area */}
      <div className="mb-8 px-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-gold text-[22px] font-extrabold tracking-[-0.04em]">gastos</span>
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
        <p className="mt-0.5 text-[9px] tracking-[0.22em] text-[#383838] uppercase">
          control de gastos
        </p>
      </div>

      {/* Divider */}
      <div className="mx-3 mb-4 h-px bg-gradient-to-r from-transparent via-[#1c1c1c] to-transparent" />

      <nav className="flex flex-1 flex-col gap-0.5" aria-label="Navegación principal">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors duration-200"
              style={{ color: active ? '#e8e6db' : '#505050' }}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'rgba(212,175,55,0.08)',
                    boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.1)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span
                className="relative transition-colors duration-200"
                style={{ color: active ? '#d4af37' : 'inherit' }}
              >
                <Icon size={15} />
              </span>
              <span className="relative">{label}</span>
              {active && (
                <span
                  className="absolute right-3 h-1 w-1 rounded-full"
                  style={{ background: '#d4af37' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom divider */}
      <div className="mx-3 mb-4 h-px bg-gradient-to-r from-transparent via-[#1c1c1c] to-transparent" />

      {/* User placeholder */}
      <div className="flex items-center gap-2.5 rounded-xl px-3 py-2">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#161616] ring-1 ring-[#242424]">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#484848"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-[#606060]">Mi cuenta</p>
        </div>
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

function WalletIcon({ size = 15 }: { size?: number }) {
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
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
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
