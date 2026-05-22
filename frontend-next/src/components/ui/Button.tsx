'use client'

import { type ButtonHTMLAttributes, forwardRef } from 'react'

import { motion } from 'framer-motion'

import { cn } from '@/lib/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, disabled, children, className, ...props },
  ref
) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-[#d4af37] focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary: 'bg-gold text-[#080808] hover:opacity-90',
    secondary: 'bg-[#161616] text-[#e2e0d5] hover:bg-[#1e1e1e]',
    ghost: 'text-[#888] hover:text-[#e2e0d5] hover:bg-[#161616]',
    danger: 'bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20',
  }

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled ?? loading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </motion.button>
  )
})
