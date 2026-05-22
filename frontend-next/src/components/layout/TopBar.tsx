'use client'

import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/expenses': 'Gastos',
  '/budgets': 'Presupuestos',
  '/reports': 'Reportes',
  '/recurring': 'Recurrentes',
}

export function TopBar() {
  const pathname = usePathname()
  const title = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ?? 'Gastos'

  return (
    <header className="md:hidden sticky top-0 z-20 bg-[#0d0d0d]/90 backdrop-blur border-b border-[#1a1a1a] px-4 h-14 flex items-center justify-between">
      <span className="font-bold text-base text-[#e2e0d5]">{title}</span>
      <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </div>
    </header>
  )
}
