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
    'inline-flex items-center justify-center font-semibold rounded-full transition-all focus-visible:outline-2 focus-visible:outline-[#d4af37] focus-visible:outline-offset-2 disabled:opacity-40 disabled:pointer-events-none'

  const variants = {
    primary: 'bg-gold text-[#060606] hover:opacity-88',
    secondary:
      'bg-[#111] text-[#e8e6db] border border-[#1c1c1c] hover:bg-[#161616] hover:border-[#242424]',
    ghost: 'text-[#808080] hover:text-[#e8e6db] hover:bg-[#141414]',
    danger: 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 hover:bg-[#ef4444]/20',
  }

  const sizes = {
    sm: 'h-8 px-3.5 text-xs gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-11 px-6 text-sm gap-2.5',
  }

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled ?? loading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </motion.button>
  )
})
