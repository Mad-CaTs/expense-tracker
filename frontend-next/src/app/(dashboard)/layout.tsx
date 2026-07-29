'use client'

import { usePathname } from 'next/navigation'

import { BottomNav } from '@/components/layout/BottomNav'
import { SheetHost } from '@/components/layout/SheetHost'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Focused routes render fullscreen — no chrome (logo/topbar, sidebar, bottom nav).
  // Las subpáginas traen su propio ← en SubPageHeader: dejarles la top-bar apilaría
  // dos cabeceras, y la bottom-nav invita a salir de una vista de detalle.
  // El prefijo cubre las rutas anidadas (/categories/12) sin enumerarlas.
  const isFocusedRoute =
    /\/(new|edit)$/.test(pathname) ||
    /^\/(categories|budgets|recurring)(\/|$)/.test(pathname)

  if (isFocusedRoute) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <div key={pathname} className="page-enter">
          {children}
        </div>
        <SheetHost />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <TopBar />

      <main id="main-content" className="pb-24 md:ml-[220px] md:pb-0">
        <div key={pathname} className="page-enter">
          {children}
        </div>
      </main>

      <SheetHost />
      <BottomNav />
    </div>
  )
}
