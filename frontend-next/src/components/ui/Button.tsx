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
  { variant = 'primary', size = 'md', loading, disabled, children, className, style, ...props },
  ref
) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-full transition-all focus-visible:outline-2 focus-visible:outline-[color:var(--accent)] focus-visible:outline-offset-2 disabled:opacity-40 disabled:pointer-events-none'

  const variants = {
    primary: 'hover:opacity-88',
    secondary: 'border hover:opacity-90',
    ghost: 'hover:opacity-80',
    danger: 'border hover:opacity-90',
  }

  const variantStyles = {
    primary: { background: 'linear-gradient(135deg, var(--accent), var(--accent-light))', color: 'var(--bg-base)' },
    secondary: { background: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-default)' },
    ghost: { color: 'var(--text-muted)' },
    danger: { background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' },
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
      style={{ ...variantStyles[variant], ...style }}
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
