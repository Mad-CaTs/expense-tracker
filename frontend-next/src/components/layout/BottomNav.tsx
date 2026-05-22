'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/expenses', label: 'Gastos', icon: ReceiptIcon },
  { href: '/budgets', label: 'Presupuestos', icon: WalletIcon },
  null,
  { href: '/reports', label: 'Reportes', icon: ChartIcon },
  { href: '/recurring', label: 'Recurrentes', icon: RepeatIcon },
]

export function BottomNav({ onFABClick }: { onFABClick: () => void }) {
  const pathname = usePathname()

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-30 border-t border-[#1a1a1a] bg-[#111] md:hidden"
      aria-label="Navegación inferior"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          if (!item) {
            return (
              <button
                key="fab"
                onClick={onFABClick}
                className="bg-gold -mt-4 flex h-12 w-12 items-center justify-center rounded-full"
                aria-label="Nuevo gasto"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#080808"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            )
          }
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-w-[48px] flex-col items-center gap-1 py-1"
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={20} color={active ? '#d4af37' : '#555'} />
              <span className="text-[10px]" style={{ color: active ? '#d4af37' : '#555' }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function ReceiptIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  )
}

function WalletIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
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

function ChartIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M7 16l4-4 4 4 4-6" />
    </svg>
  )
}

function RepeatIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
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
