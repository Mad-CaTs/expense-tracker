'use client'

import { usePathname } from 'next/navigation'

import { OnboardingGate } from '@/components/features/onboarding/OnboardingGate'
import { BottomNav } from '@/components/layout/BottomNav'
import { SheetHost } from '@/components/layout/SheetHost'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  const isFocusedRoute =
    /\/(new|edit)$/.test(pathname) ||
    pathname === '/welcome' ||
    /^\/(categories|budgets|recurring)(\/|$)/.test(pathname) ||
    /^\/reports\/.+/.test(pathname)

  if (isFocusedRoute) {
    return (
      <OnboardingGate>
        <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
          <div key={pathname} className="page-enter">
            {children}
          </div>
          <SheetHost />
        </div>
      </OnboardingGate>
    )
  }

  return (
    <OnboardingGate>
      <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <Sidebar />
        <TopBar />

        {/* pb-32: la bottom-nav es `fixed` y flota SOBRE el contenido (58px de
            alto + pb-4 + safe-area). Con pb-24 la última tarjeta de la página
            —presupuestos en /expenses— quedaba medio tapada por ella. */}
        <main id="main-content" className="pb-32 md:ml-[220px] md:pb-0">
          <div key={pathname} className="page-enter">
            {children}
          </div>
        </main>

        <SheetHost />
        <BottomNav />
      </div>
    </OnboardingGate>
  )
}
