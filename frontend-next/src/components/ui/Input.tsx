import { type InputHTMLAttributes, forwardRef } from 'react'

import { cn } from '@/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-[#888] uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'h-10 w-full rounded-xl bg-[#161616] px-3 text-sm text-[#e2e0d5] placeholder:text-[#555]',
          'border border-transparent focus:border-[#d4af37] focus:outline-none transition-colors',
          error && 'border-[#ef4444]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
    </div>
  )
})
