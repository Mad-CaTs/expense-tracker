'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { motion } from 'framer-motion'

import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [, setShowExpenseModal] = useState(false)

  // Focused routes render fullscreen — no chrome (logo/topbar, sidebar, bottom nav)
  const isFocusedRoute =
    /\/(new|edit)$/.test(pathname) || pathname === '/categories' || pathname === '/budgets'

  if (isFocusedRoute) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <TopBar />

      <main id="main-content" className="pb-24 md:ml-[220px] md:pb-0">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>

      <BottomNav onFABClick={() => setShowExpenseModal(true)} />
    </div>
  )
}
