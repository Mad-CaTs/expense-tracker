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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-col border-r border-[#1a1a1a] bg-[#111] px-3 py-6 md:flex">
      <div className="mb-8 px-3">
        <span className="text-gold text-xl font-extrabold tracking-tight">gastos</span>
        <p className="mt-0.5 text-[10px] tracking-[0.2em] text-[#555] uppercase">smart tracker</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Navegación principal">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
              style={{ color: active ? '#d4af37' : '#888' }}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-[#d4af37]/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={16} />
              <span className="relative">{label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

function ReceiptIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  )
}

function WalletIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
    </svg>
  )
}

function ChartIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M7 16l4-4 4 4 4-6" />
    </svg>
  )
}

function RepeatIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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
