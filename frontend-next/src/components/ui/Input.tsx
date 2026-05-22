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
        <label
          htmlFor={inputId}
          className="text-[10px] font-semibold tracking-[0.15em] text-[#484848] uppercase"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'rounded-xl border p-[1px] transition-colors',
          error ? 'border-[#ef4444]/50' : 'border-[#1c1c1c] focus-within:border-[#d4af37]/60'
        )}
      >
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'inset-highlight h-10 w-full rounded-[10px] bg-[#111] px-3 text-sm text-[#e8e6db] placeholder:text-[#383838]',
            'transition-colors outline-none',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] text-[#ef4444]">{error}</p>}
    </div>
  )
})
