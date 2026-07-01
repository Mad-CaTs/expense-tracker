'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { BarChart2, Receipt, Settings, Wallet } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/expenses', label: 'Finanzas', Icon: Receipt   },
  { href: '/wallets',  label: 'Cuentas',  Icon: Wallet    },
  { href: '/reports',  label: 'Reportes', Icon: BarChart2 },
  { href: '/account',  label: 'Cuenta',   Icon: Settings  },
]

export function BottomNav({ onFABClick }: { onFABClick?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-4 md:hidden">
      <nav
        className="flex items-center gap-1 rounded-full border px-2 py-2 backdrop-blur-md"
        style={{ borderColor: 'var(--border-default)', background: 'var(--bottomnav-bg)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
        aria-label="Navegación"
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href)
          const { Icon } = item

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              className="flex items-center gap-2 rounded-full px-3.5 py-2.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{ background: active ? 'var(--accent-bg)' : 'transparent' }}
            >
              <Icon
                size={18}
                strokeWidth={active ? 2 : 1.7}
                style={{ color: active ? 'var(--accent)' : 'var(--text-tertiary)', flexShrink: 0 }}
              />
              <span
                className={`overflow-hidden whitespace-nowrap text-[12px] font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  active ? 'max-w-[80px] opacity-100' : 'max-w-0 opacity-0'
                }`}
                style={{ color: 'var(--accent)' }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
