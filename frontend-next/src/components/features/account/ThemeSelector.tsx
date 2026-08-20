'use client'

import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'

import { useTheme, type ThemePreference } from '@/providers/ThemeProvider'

const OPTIONS: { key: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { key: 'light', label: 'Claro', Icon: Sun },
  { key: 'dark', label: 'Oscuro', Icon: Moon },
]

/**
 * Segmented y no un interruptor: con dos opciones nombradas se ve cuál está
 * activa sin tener que interpretar la posición de una palanca.
 */
export function ThemeSelector() {
  const { preference, setPreference } = useTheme()

  return (
    <div className="liquid-glass mx-4 mb-[18px] flex gap-1.5 rounded-full p-[5px]">
      {OPTIONS.map(({ key, label, Icon }) => {
        const on = preference === key
        return (
          <motion.button
            key={key}
            type="button"
            onClick={() => setPreference(key)}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full py-2 text-[12.5px] font-bold transition-colors"
            style={on
              ? { background: 'var(--accent-light)', color: 'var(--bg-base)' }
              : { color: 'var(--text-muted)' }}
          >
            <Icon size={14} strokeWidth={2} />
            {label}
          </motion.button>
        )
      })}
    </div>
  )
}
