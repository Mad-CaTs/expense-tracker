'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [, setShowExpenseModal] = useState(false)

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Sidebar />
      <TopBar />

      <main id="main-content" className="pb-20 md:ml-[220px] md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav onFABClick={() => setShowExpenseModal(true)} />
    </div>
  )
}
